import { describe, expect, it } from "vitest";
import {
  calculateCommissionBreakdown,
  calculatePartialRefundBreakdown,
  evaluateBankTransferAmount,
  formatMinorUnits,
  ImmutableFinancialLedger,
  tlToKurus,
} from "@/lib/finance/commission";

describe("InfluNex 15% Commission (1500 BPS) & Accounting Engine", () => {
  it("calculates exact 15% commission and 85% creator payout for 100 TL, 1.000 TL, 5.000 TL, and 10.000 TL", () => {
    // 100 TL -> 15 TL commission, 85 TL payout
    const c100 = calculateCommissionBreakdown(tlToKurus(100));
    expect(c100.grossAmountMinorUnits).toBe(10000);
    expect(c100.platformCommissionMinorUnits).toBe(1500);
    expect(c100.creatorNetPayoutMinorUnits).toBe(8500);

    // 1.000 TL -> 150 TL commission, 850 TL payout
    const c1000 = calculateCommissionBreakdown(tlToKurus(1000));
    expect(c1000.grossAmountMinorUnits).toBe(100000);
    expect(c1000.platformCommissionMinorUnits).toBe(15000);
    expect(c1000.creatorNetPayoutMinorUnits).toBe(85000);

    // 5.000 TL -> 750 TL commission, 4.250 TL payout
    const c5000 = calculateCommissionBreakdown(tlToKurus(5000));
    expect(c5000.grossAmountMinorUnits).toBe(500000);
    expect(c5000.platformCommissionMinorUnits).toBe(75000);
    expect(c5000.creatorNetPayoutMinorUnits).toBe(425000);

    // 10.000 TL -> 1.500 TL commission, 8.500 TL payout
    const c10000 = calculateCommissionBreakdown(tlToKurus(10000));
    expect(c10000.grossAmountMinorUnits).toBe(1000000);
    expect(c10000.platformCommissionMinorUnits).toBe(150000);
    expect(c10000.creatorNetPayoutMinorUnits).toBe(850000);
  });

  it("preserves exact conservation of money on fractional kuruş rounding", () => {
    const oddAmounts = [10001, 12345, 33333, 99999, 149999];
    for (const gross of oddAmounts) {
      const res = calculateCommissionBreakdown(gross);
      expect(
        res.platformCommissionMinorUnits + res.creatorNetPayoutMinorUnits
      ).toBe(gross);
    }
  });

  it("rejects floating-point numbers and zero or negative amounts", () => {
    expect(() => calculateCommissionBreakdown(100.5)).toThrow(
      /FINANCE_INTEGER_VIOLATION/
    );
    expect(() => calculateCommissionBreakdown(0)).toThrow(
      /FINANCE_ZERO_AMOUNT/
    );
    expect(() => calculateCommissionBreakdown(-5000)).toThrow(
      /FINANCE_INTEGER_VIOLATION/
    );
  });

  it("calculates partial refunds accurately while preserving 15%/85% split on retained amount", () => {
    // 10.000 TL order with 4.000 TL partial refund -> 6.000 TL retained -> 900 TL commission, 5.100 TL creator payout
    const refund = calculatePartialRefundBreakdown(1000000, 400000);
    expect(refund.retainedGrossMinorUnits).toBe(600000);
    expect(refund.retainedPlatformCommissionMinorUnits).toBe(90000);
    expect(refund.retainedCreatorPayoutMinorUnits).toBe(510000);
  });

  it("classifies exact, underpaid, and overpaid bank transfers properly", () => {
    const exact = evaluateBankTransferAmount(500000, 500000);
    expect(exact.status).toBe("EXACT_MATCH");
    expect(exact.canApproveOrderPayment).toBe(true);

    const under = evaluateBankTransferAmount(500000, 480000);
    expect(under.status).toBe("UNDERPAID");
    expect(under.canApproveOrderPayment).toBe(false);

    const over = evaluateBankTransferAmount(500000, 525000);
    expect(over.status).toBe("OVERPAID");
    expect(over.differenceMinorUnits).toBe(25000);
    expect(over.canApproveOrderPayment).toBe(true);
    expect(over.requiresAdjustmentLedgerEntry).toBe(true);
  });

  it("prevents duplicate payouts (idempotency & concurrency) and exports Excel-compatible UTF-8 BOM CSV", () => {
    const ledger = new ImmutableFinancialLedger();

    ledger.appendEntry({
      orderId: "ord_1",
      orderCode: "INF-2026-000001",
      entryType: "CREATOR_PAYOUT_SETTLED",
      amountMinorUnits: 850000,
      currency: "TRY",
      direction: "DEBIT",
      bankReferenceId: "FAST-998811",
      idempotencyKey: "payout_ord_1_first",
      notes: "%85 hakediş ödemesi",
      createdBy: "admin_1",
    });

    // Attempting same idempotencyKey fails
    expect(() =>
      ledger.appendEntry({
        orderId: "ord_1",
        orderCode: "INF-2026-000001",
        entryType: "CREATOR_PAYOUT_SETTLED",
        amountMinorUnits: 850000,
        currency: "TRY",
        direction: "DEBIT",
        bankReferenceId: "FAST-998811",
        idempotencyKey: "payout_ord_1_first",
        notes: "Mükerrer deneme",
        createdBy: "admin_1",
      })
    ).toThrow(/DUPLICATE_FINANCIAL_OPERATION/);

    // Attempting a second payout for the same orderId with a different idempotencyKey ALSO fails
    expect(() =>
      ledger.appendEntry({
        orderId: "ord_1",
        orderCode: "INF-2026-000001",
        entryType: "CREATOR_PAYOUT_SETTLED",
        amountMinorUnits: 850000,
        currency: "TRY",
        direction: "DEBIT",
        bankReferenceId: "FAST-998822",
        idempotencyKey: "payout_ord_1_second",
        notes: "Farklı anahtarla mükerrer ödeme denemesi",
        createdBy: "admin_1",
      })
    ).toThrow(/DUPLICATE_PAYOUT_BLOCKED/);

    const csv = ledger.exportToCsv();
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("INF-2026-000001");
    expect(csv).toContain("8500.00");
    expect(formatMinorUnits(1000000)).toBe("10.000 TL");
  });
});
