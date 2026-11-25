/**
 * INFLUNEX BACKEND COMMISSION & ACCOUNTING ENGINE
 * Immutable Business Model:
 * - Platform Commission: 15% (1500 Basis Points)
 * - Creator Payout: 85% (8500 Basis Points)
 * - No subscriptions, no tokens, no wallets, no hidden fees.
 * - All monetary values are stored and calculated in integer minor units (kuruş / cents).
 */

import type { CurrencyCode, FinancialLedgerEntry } from "../types/domain";
import { INFLUNEX_TENANT_ID } from "../firebase/isolation";

export const PLATFORM_COMMISSION_BPS = 1500 as const; // 15.00%
export const CREATOR_PAYOUT_BPS = 8500 as const; // 85.00%
export const BPS_DENOMINATOR = 10000 as const; // 100.00%

export interface CommissionBreakdown {
  grossAmountMinorUnits: number;
  commissionBps: typeof PLATFORM_COMMISSION_BPS;
  creatorPayoutBps: typeof CREATOR_PAYOUT_BPS;
  platformCommissionMinorUnits: number;
  creatorNetPayoutMinorUnits: number;
  currency: CurrencyCode;
}

export interface PartialRefundBreakdown {
  originalGrossMinorUnits: number;
  refundedToAdvertiserMinorUnits: number;
  retainedGrossMinorUnits: number;
  retainedPlatformCommissionMinorUnits: number;
  retainedCreatorPayoutMinorUnits: number;
  currency: CurrencyCode;
}

export interface PaymentDiscrepancyEvaluation {
  status: "EXACT_MATCH" | "UNDERPAID" | "OVERPAID";
  expectedMinorUnits: number;
  receivedMinorUnits: number;
  differenceMinorUnits: number;
  canApproveOrderPayment: boolean;
  requiresAdjustmentLedgerEntry: boolean;
}

/**
 * Converts major currency units (e.g. 5000 TL) to integer minor units (500000 kuruş) safely.
 */
export function tlToKurus(amountTl: number): number {
  if (!Number.isFinite(amountTl) || amountTl < 0) {
    throw new Error("Invalid monetary amount");
  }
  return Math.round(amountTl * 100);
}

/**
 * Converts integer minor units (kuruş) to major unit number for display only.
 */
export function kurusToTl(minorUnits: number): number {
  assertIntegerMinorUnits(minorUnits, "minorUnits");
  return minorUnits / 100;
}

/**
 * Formats integer minor units (kuruş) as a localized currency string (e.g. "10.000,00 TL" or "10.000 TL").
 */
export function formatMinorUnits(
  minorUnits: number,
  currency: CurrencyCode = "TRY",
  locale: "tr" | "en" = "tr",
  showDecimals = false
): string {
  assertIntegerMinorUnits(minorUnits, "minorUnits");
  const major = minorUnits / 100;
  const formatted = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: showDecimals ? 2 : major % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(major);

  if (currency === "TRY") {
    return `${formatted} TL`;
  }
  return `${formatted} ${currency}`;
}

export function assertIntegerMinorUnits(
  amount: number,
  fieldName = "amountMinorUnits"
): void {
  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    !Number.isSafeInteger(amount) ||
    amount < 0
  ) {
    throw new Error(
      `[FINANCE_INTEGER_VIOLATION] ${fieldName} must be a non-negative safe integer in minor units (kuruş). Received: ${String(amount)}`
    );
  }
}

/**
 * Core deterministic 15% commission / 85% creator payout calculation in minor units (kuruş).
 * Guarantees: platformCommissionMinorUnits + creatorNetPayoutMinorUnits === grossAmountMinorUnits.
 */
export function calculateCommissionBreakdown(
  grossAmountMinorUnits: number,
  currency: CurrencyCode = "TRY"
): CommissionBreakdown {
  assertIntegerMinorUnits(grossAmountMinorUnits, "grossAmountMinorUnits");
  if (grossAmountMinorUnits <= 0) {
    throw new Error(
      "[FINANCE_ZERO_AMOUNT] Order gross amount must be greater than zero."
    );
  }

  const platformCommissionMinorUnits = Math.round(
    (grossAmountMinorUnits * PLATFORM_COMMISSION_BPS) / BPS_DENOMINATOR
  );
  const creatorNetPayoutMinorUnits =
    grossAmountMinorUnits - platformCommissionMinorUnits;

  return {
    grossAmountMinorUnits,
    commissionBps: PLATFORM_COMMISSION_BPS,
    creatorPayoutBps: CREATOR_PAYOUT_BPS,
    platformCommissionMinorUnits,
    creatorNetPayoutMinorUnits,
    currency,
  };
}

/**
 * Evaluates partial refund scenarios while preserving the 15% / 85% split on any retained portion.
 */
export function calculatePartialRefundBreakdown(
  originalGrossMinorUnits: number,
  refundedToAdvertiserMinorUnits: number,
  currency: CurrencyCode = "TRY"
): PartialRefundBreakdown {
  assertIntegerMinorUnits(originalGrossMinorUnits, "originalGrossMinorUnits");
  assertIntegerMinorUnits(
    refundedToAdvertiserMinorUnits,
    "refundedToAdvertiserMinorUnits"
  );

  if (
    originalGrossMinorUnits <= 0 ||
    refundedToAdvertiserMinorUnits > originalGrossMinorUnits
  ) {
    throw new Error("[FINANCE_INVALID_REFUND] Refund cannot exceed original order gross amount.");
  }

  const retainedGrossMinorUnits =
    originalGrossMinorUnits - refundedToAdvertiserMinorUnits;

  const retainedPlatformCommissionMinorUnits = Math.round(
    (retainedGrossMinorUnits * PLATFORM_COMMISSION_BPS) / BPS_DENOMINATOR
  );
  const retainedCreatorPayoutMinorUnits =
    retainedGrossMinorUnits - retainedPlatformCommissionMinorUnits;

  return {
    originalGrossMinorUnits,
    refundedToAdvertiserMinorUnits,
    retainedGrossMinorUnits,
    retainedPlatformCommissionMinorUnits,
    retainedCreatorPayoutMinorUnits,
    currency,
  };
}

/**
 * Evaluates bank wire/EFT/FAST transfers for exact match, underpayment, or overpayment.
 */
export function evaluateBankTransferAmount(
  expectedMinorUnits: number,
  receivedMinorUnits: number
): PaymentDiscrepancyEvaluation {
  assertIntegerMinorUnits(expectedMinorUnits, "expectedMinorUnits");
  assertIntegerMinorUnits(receivedMinorUnits, "receivedMinorUnits");

  if (expectedMinorUnits <= 0 || receivedMinorUnits <= 0) {
    throw new Error("[FINANCE_INVALID_PAYMENT] Payment amounts must be positive integers.");
  }

  const differenceMinorUnits = receivedMinorUnits - expectedMinorUnits;

  if (differenceMinorUnits === 0) {
    return {
      status: "EXACT_MATCH",
      expectedMinorUnits,
      receivedMinorUnits,
      differenceMinorUnits: 0,
      canApproveOrderPayment: true,
      requiresAdjustmentLedgerEntry: false,
    };
  }

  if (differenceMinorUnits < 0) {
    return {
      status: "UNDERPAID",
      expectedMinorUnits,
      receivedMinorUnits,
      differenceMinorUnits,
      canApproveOrderPayment: false,
      requiresAdjustmentLedgerEntry: true,
    };
  }

  return {
    status: "OVERPAID",
    expectedMinorUnits,
    receivedMinorUnits,
    differenceMinorUnits,
    canApproveOrderPayment: true,
    requiresAdjustmentLedgerEntry: true,
  };
}

/**
 * Append-only, idempotent in-memory/Firestore-backed Financial Ledger Manager.
 * Financial records can NEVER be deleted; corrections require explicit REVERSAL_ADJUSTMENT entries.
 */
export class ImmutableFinancialLedger {
  private entries: FinancialLedgerEntry[] = [];
  private idempotencyKeys = new Set<string>();
  private settledPayoutOrderIds = new Set<string>();

  public appendEntry(
    input: Omit<FinancialLedgerEntry, "id" | "tenantId" | "createdAt">
  ): FinancialLedgerEntry {
    assertIntegerMinorUnits(input.amountMinorUnits, "amountMinorUnits");

    if (!input.idempotencyKey || input.idempotencyKey.trim().length < 6) {
      throw new Error("[LEDGER_IDEMPOTENCY_REQUIRED] Valid idempotencyKey is required.");
    }

    if (this.idempotencyKeys.has(input.idempotencyKey)) {
      throw new Error(
        `[DUPLICATE_FINANCIAL_OPERATION] Operation with idempotencyKey="${input.idempotencyKey}" has already been processed.`
      );
    }

    if (input.entryType === "CREATOR_PAYOUT_SETTLED") {
      if (this.settledPayoutOrderIds.has(input.orderId)) {
        throw new Error(
          `[DUPLICATE_PAYOUT_BLOCKED] Creator payout for orderId="${input.orderId}" has already been settled.`
        );
      }
      this.settledPayoutOrderIds.add(input.orderId);
    }

    this.idempotencyKeys.add(input.idempotencyKey);

    const entry: FinancialLedgerEntry = {
      ...input,
      id: `led_${Date.now()}_${this.entries.length + 1}`,
      tenantId: INFLUNEX_TENANT_ID,
      createdAt: new Date().toISOString(),
    };

    this.entries.push(Object.freeze(entry));
    return entry;
  }

  public getEntriesForOrder(orderId: string): FinancialLedgerEntry[] {
    return this.entries.filter((e) => e.orderId === orderId);
  }

  public getAllEntries(): FinancialLedgerEntry[] {
    return [...this.entries];
  }

  /**
   * Exports ledger entries as RFC 4180 CSV with UTF-8 BOM for Excel accounting compatibility.
   */
  public exportToCsv(): string {
    const headers = [
      "ID",
      "Tenant",
      "SiparisKodu",
      "SiparisID",
      "IslemTuru",
      "Yon",
      "TutarKurus",
      "TutarTL",
      "ParaBirimi",
      "BankaReferansNo",
      "IdempotencyKey",
      "Aciklama",
      "IsleyenKullanici",
      "Tarih",
    ];

    const escapeCsv = (val: string | number | undefined): string => {
      const str = val === undefined ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = this.entries.map((e) => [
      e.id,
      e.tenantId,
      e.orderCode,
      e.orderId,
      e.entryType,
      e.direction,
      e.amountMinorUnits,
      (e.amountMinorUnits / 100).toFixed(2),
      e.currency,
      e.bankReferenceId || "",
      e.idempotencyKey,
      e.notes,
      e.createdBy,
      e.createdAt,
    ]);

    const csvBody = [
      headers.join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ].join("\r\n");

    return `\uFEFF${csvBody}`;
  }
}
