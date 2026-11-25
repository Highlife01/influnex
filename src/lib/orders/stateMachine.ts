/**
 * INFLUNEX 15-STATE ORDER STATE MACHINE & BANK TRANSFER VERIFICATION ENGINE
 * - Zero direct client-side state updates.
 * - Full audit trail (`orderEvents`) for every state transition.
 * - Prevents duplicate `bankTransactionRef` across orders.
 * - Enforces Ticaret Bakanlığı sponsor disclosure (`#reklam` / `#işbirliği`) on publication.
 * - Automatically accrues 85% creator payout and 15% platform commission upon completion.
 */

import type {
  OrderEventRecord,
  OrderRecord,
  OrderStatus,
  UserRole,
} from "../types/domain";
import { INFLUNEX_TENANT_ID } from "../firebase/isolation";
import {
  calculateCommissionBreakdown,
  evaluateBankTransferAmount,
  ImmutableFinancialLedger,
} from "../finance/commission";

interface TransitionRule {
  from: OrderStatus[];
  to: OrderStatus;
  allowedRoles: UserRole[];
}

const TRANSITION_RULES: TransitionRule[] = [
  {
    from: ["PAYMENT_PENDING"],
    to: "PAYMENT_REVIEW",
    allowedRoles: ["ADVERTISER"],
  },
  {
    from: ["PAYMENT_PENDING", "PAYMENT_REVIEW"],
    to: "CANCELLED",
    allowedRoles: ["ADVERTISER", "ADMIN"],
  },
  {
    from: ["PAYMENT_REVIEW"],
    to: "PAID",
    allowedRoles: ["ADMIN"],
  },
  {
    from: ["PAYMENT_REVIEW"],
    to: "PAYMENT_PENDING",
    allowedRoles: ["ADMIN"],
  },
  {
    from: ["PAID"],
    to: "IN_PROGRESS",
    allowedRoles: ["CREATOR", "ADMIN"],
  },
  {
    from: ["IN_PROGRESS", "REVISION_REQUESTED"],
    to: "CONTENT_SUBMITTED",
    allowedRoles: ["CREATOR"],
  },
  {
    from: ["CONTENT_SUBMITTED"],
    to: "REVISION_REQUESTED",
    allowedRoles: ["ADVERTISER"],
  },
  {
    from: ["CONTENT_SUBMITTED"],
    to: "CONTENT_APPROVED",
    allowedRoles: ["ADVERTISER"],
  },
  {
    from: ["CONTENT_APPROVED"],
    to: "PUBLISHED",
    allowedRoles: ["CREATOR"],
  },
  {
    from: ["PUBLISHED"],
    to: "COMPLETED",
    allowedRoles: ["ADVERTISER", "ADMIN"],
  },
  {
    from: ["COMPLETED"],
    to: "PAYOUT_PENDING",
    allowedRoles: ["ADMIN"],
  },
  {
    from: ["PAYOUT_PENDING"],
    to: "PAYOUT_COMPLETED",
    allowedRoles: ["ADMIN"],
  },
  {
    from: ["PAID", "IN_PROGRESS", "CONTENT_SUBMITTED", "REVISION_REQUESTED"],
    to: "DISPUTED",
    allowedRoles: ["ADVERTISER", "CREATOR", "ADMIN"],
  },
  {
    from: ["DISPUTED", "PAID"],
    to: "REFUND_PENDING",
    allowedRoles: ["ADMIN"],
  },
  {
    from: ["REFUND_PENDING"],
    to: "REFUNDED",
    allowedRoles: ["ADMIN"],
  },
];

export interface TransitionRequest {
  orderId: string;
  actorId: string;
  actorRole: UserRole;
  targetStatus: OrderStatus;
  reason: string;
  receiptFilePath?: string;
  bankTransactionRef?: string;
  paidAmountMinorUnits?: number;
  submittedContentUrl?: string;
  publishedPostUrl?: string;
  sponsorDisclosureConfirmed?: boolean;
  payoutTransactionRef?: string;
  idempotencyKey?: string;
}

export class OrderStateMachineEngine {
  private orders = new Map<string, OrderRecord>();
  private events: OrderEventRecord[] = [];
  private usedBankTransactionRefs = new Map<string, string>(); // ref -> orderId
  private sequenceCounter = 0;
  public readonly ledger: ImmutableFinancialLedger;

  constructor(ledger?: ImmutableFinancialLedger) {
    this.ledger = ledger || new ImmutableFinancialLedger();
  }

  public generateOrderCode(year = 2026): string {
    this.sequenceCounter += 1;
    return `INF-${year}-${String(this.sequenceCounter).padStart(6, "0")}`;
  }

  public createOrder(input: {
    id?: string;
    sourceType: "DIRECT_SERVICE" | "CAMPAIGN_PROPOSAL";
    campaignId?: string;
    proposalId?: string;
    advertiserId: string;
    advertiserBrandName: string;
    creatorId: string;
    creatorUsername: string;
    serviceId: string;
    serviceTitle: string;
    platform: OrderRecord["snapshot"]["platform"];
    grossAmountMinorUnits: number;
    deliveryDays: number;
    maxRevisions: number;
    usageRights: string;
    paidAdsReuseAllowed: boolean;
    acceptedTermsVersion: string;
  }): OrderRecord {
    if (input.advertiserId === input.creatorId) {
      throw new Error("[SELF_ORDER_BLOCKED] Users cannot place orders on their own services.");
    }

    const breakdown = calculateCommissionBreakdown(
      input.grossAmountMinorUnits,
      "TRY"
    );
    const now = new Date().toISOString();
    const orderCode = this.generateOrderCode(2026);
    const id = input.id || `ord_${this.sequenceCounter}`;

    const order: OrderRecord = {
      id,
      orderCode,
      tenantId: INFLUNEX_TENANT_ID,
      sourceType: input.sourceType,
      campaignId: input.campaignId,
      proposalId: input.proposalId,
      advertiserId: input.advertiserId,
      advertiserBrandName: input.advertiserBrandName,
      creatorId: input.creatorId,
      creatorUsername: input.creatorUsername,
      status: "PAYMENT_PENDING",
      snapshot: Object.freeze({
        serviceId: input.serviceId,
        serviceTitle: input.serviceTitle,
        platform: input.platform,
        grossAmountMinorUnits: breakdown.grossAmountMinorUnits,
        commissionBps: breakdown.commissionBps,
        creatorPayoutBps: breakdown.creatorPayoutBps,
        platformCommissionMinorUnits: breakdown.platformCommissionMinorUnits,
        creatorNetPayoutMinorUnits: breakdown.creatorNetPayoutMinorUnits,
        currency: breakdown.currency,
        deliveryDays: input.deliveryDays,
        maxRevisions: input.maxRevisions,
        usageRights: input.usageRights,
        paidAdsReuseAllowed: input.paidAdsReuseAllowed,
        requiresSponsorDisclosure: true,
        acceptedTermsVersion: input.acceptedTermsVersion,
        capturedAt: now,
      }),
      revisionsUsed: 0,
      sponsorDisclosureTagVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    this.recordEvent({
      order,
      actorId: input.advertiserId,
      actorRole: "ADVERTISER",
      previousStatus: null,
      newStatus: "PAYMENT_PENDING",
      reason: "Sipariş oluşturuldu; banka havalesi / EFT / FAST dekontu bekleniyor.",
    });

    return order;
  }

  public getOrder(orderId: string): OrderRecord | undefined {
    return this.orders.get(orderId);
  }

  public getAllOrders(): OrderRecord[] {
    return Array.from(this.orders.values());
  }

  public getOrderEvents(orderId: string): OrderEventRecord[] {
    return this.events.filter((e) => e.orderId === orderId);
  }

  public transition(req: TransitionRequest): OrderRecord {
    const order = this.orders.get(req.orderId);
    if (!order) {
      throw new Error(`[ORDER_NOT_FOUND] Order ${req.orderId} does not exist.`);
    }

    // 1. Verify Ownership / Role authorization
    if (
      req.actorRole === "ADVERTISER" &&
      req.actorId !== order.advertiserId
    ) {
      throw new Error("[IDOR_BLOCKED] Advertiser does not own this order.");
    }
    if (req.actorRole === "CREATOR" && req.actorId !== order.creatorId) {
      throw new Error("[IDOR_BLOCKED] Creator is not assigned to this order.");
    }

    const rule = TRANSITION_RULES.find(
      (r) =>
        r.from.includes(order.status) &&
        r.to === req.targetStatus
    );

    if (!rule) {
      throw new Error(
        `[INVALID_STATE_TRANSITION] Cannot transition order from ${order.status} to ${req.targetStatus}.`
      );
    }

    if (!rule.allowedRoles.includes(req.actorRole)) {
      throw new Error(
        `[UNAUTHORIZED_ROLE_TRANSITION] Role ${req.actorRole} is not permitted to transition order to ${req.targetStatus}.`
      );
    }

    // 2. Domain-Specific Guard Checks per Target State
    if (req.targetStatus === "PAYMENT_REVIEW") {
      if (!req.receiptFilePath || !req.receiptFilePath.startsWith("influnex/private/receipts/")) {
        throw new Error(
          "[RECEIPT_REQUIRED] Isolated private receipt file path is required to submit payment for review."
        );
      }
      order.receiptFilePath = req.receiptFilePath;
    }

    if (req.targetStatus === "PAID") {
      if (!req.bankTransactionRef || req.bankTransactionRef.trim().length < 4) {
        throw new Error(
          "[BANK_REF_REQUIRED] Bank transaction reference number is required for admin payment approval."
        );
      }
      const normalizedRef = req.bankTransactionRef.trim().toUpperCase();
      const existingOrderForRef = this.usedBankTransactionRefs.get(normalizedRef);
      if (existingOrderForRef && existingOrderForRef !== order.id) {
        throw new Error(
          `[DUPLICATE_BANK_TRANSFER_REF] Bank transaction reference "${normalizedRef}" was already used for order ${existingOrderForRef}.`
        );
      }

      const paidAmount =
        req.paidAmountMinorUnits ?? order.snapshot.grossAmountMinorUnits;
      const evaluation = evaluateBankTransferAmount(
        order.snapshot.grossAmountMinorUnits,
        paidAmount
      );
      if (!evaluation.canApproveOrderPayment) {
        throw new Error(
          `[UNDERPAID_TRANSFER_BLOCKED] Expected ${order.snapshot.grossAmountMinorUnits} kuruş, received ${paidAmount} kuruş.`
        );
      }

      this.usedBankTransactionRefs.set(normalizedRef, order.id);
      order.bankTransactionRef = normalizedRef;

      this.ledger.appendEntry({
        orderId: order.id,
        orderCode: order.orderCode,
        entryType: "PAYMENT_COLLECTED",
        amountMinorUnits: order.snapshot.grossAmountMinorUnits,
        currency: order.snapshot.currency,
        direction: "CREDIT",
        bankReferenceId: normalizedRef,
        idempotencyKey: req.idempotencyKey || `pay_collect_${order.id}_${normalizedRef}`,
        notes: `Banka havalesi/EFT onaylandı (${normalizedRef})`,
        createdBy: req.actorId,
      });

      if (evaluation.status === "OVERPAID") {
        this.ledger.appendEntry({
          orderId: order.id,
          orderCode: order.orderCode,
          entryType: "REVERSAL_ADJUSTMENT",
          amountMinorUnits: evaluation.differenceMinorUnits,
          currency: order.snapshot.currency,
          direction: "DEBIT",
          bankReferenceId: normalizedRef,
          idempotencyKey: `overpay_adj_${order.id}_${normalizedRef}`,
          notes: `Fazla ödeme fark kaydı (${evaluation.differenceMinorUnits} kuruş iade/mahsup bekliyor)`,
          createdBy: req.actorId,
        });
      }
    }

    if (req.targetStatus === "CONTENT_SUBMITTED") {
      if (!req.submittedContentUrl) {
        throw new Error(
          "[CONTENT_URL_REQUIRED] Creator must provide a valid content preview or deliverable URL."
        );
      }
      order.submittedContentUrl = req.submittedContentUrl;
      order.submittedContentNotes = req.reason;
    }

    if (req.targetStatus === "REVISION_REQUESTED") {
      if (order.revisionsUsed >= order.snapshot.maxRevisions) {
        throw new Error(
          `[MAX_REVISIONS_EXCEEDED] Maximum allowed revisions (${order.snapshot.maxRevisions}) already used.`
        );
      }
      order.revisionsUsed += 1;
    }

    if (req.targetStatus === "PUBLISHED") {
      if (!req.publishedPostUrl) {
        throw new Error("[PUBLISHED_URL_REQUIRED] Live publication link is required.");
      }
      if (!req.sponsorDisclosureConfirmed) {
        throw new Error(
          "[SPONSOR_DISCLOSURE_REQUIRED] Ticaret Bakanlığı mevzuatı gereği #reklam veya #işbirliği etiketi onayı zorunludur."
        );
      }
      order.publishedPostUrl = req.publishedPostUrl;
      order.sponsorDisclosureTagVerified = true;
    }

    const previousStatus = order.status;
    order.status = req.targetStatus;
    order.updatedAt = new Date().toISOString();

    this.recordEvent({
      order,
      actorId: req.actorId,
      actorRole: req.actorRole,
      previousStatus,
      newStatus: req.targetStatus,
      reason: req.reason,
      referenceFileUrl: req.receiptFilePath || req.submittedContentUrl || req.publishedPostUrl,
      bankReferenceId: req.bankTransactionRef || req.payoutTransactionRef,
    });

    // When order reaches COMPLETED, automatically recognize 15% commission and accrue 85% payout (PAYOUT_PENDING)
    if (req.targetStatus === "COMPLETED") {
      this.ledger.appendEntry({
        orderId: order.id,
        orderCode: order.orderCode,
        entryType: "COMMISSION_RECOGNIZED",
        amountMinorUnits: order.snapshot.platformCommissionMinorUnits,
        currency: order.snapshot.currency,
        direction: "CREDIT",
        idempotencyKey: `comm_rec_${order.id}`,
        notes: `%15 Platform komisyonu tahakkuku (${order.orderCode})`,
        createdBy: req.actorId,
      });

      this.ledger.appendEntry({
        orderId: order.id,
        orderCode: order.orderCode,
        entryType: "CREATOR_PAYOUT_ACCRUED",
        amountMinorUnits: order.snapshot.creatorNetPayoutMinorUnits,
        currency: order.snapshot.currency,
        direction: "DEBIT",
        idempotencyKey: `payout_acc_${order.id}`,
        notes: `%85 Influencer hakediş tahakkuku (${order.orderCode})`,
        createdBy: req.actorId,
      });

      order.status = "PAYOUT_PENDING";
      this.recordEvent({
        order,
        actorId: "SYSTEM",
        actorRole: "ADMIN",
        previousStatus: "COMPLETED",
        newStatus: "PAYOUT_PENDING",
        reason: "Sipariş tamamlandı; %15 komisyon ayrıldı ve %85 influencer hakedişi ödeme kuyruğuna alındı.",
      });
    }

    if (req.targetStatus === "PAYOUT_COMPLETED") {
      if (!req.payoutTransactionRef || req.payoutTransactionRef.trim().length < 4) {
        throw new Error(
          "[PAYOUT_REF_REQUIRED] Bank payout transaction reference is required to mark payout as completed."
        );
      }
      order.payoutTransactionRef = req.payoutTransactionRef.trim().toUpperCase();
      this.ledger.appendEntry({
        orderId: order.id,
        orderCode: order.orderCode,
        entryType: "CREATOR_PAYOUT_SETTLED",
        amountMinorUnits: order.snapshot.creatorNetPayoutMinorUnits,
        currency: order.snapshot.currency,
        direction: "DEBIT",
        bankReferenceId: order.payoutTransactionRef,
        idempotencyKey:
          req.idempotencyKey || `payout_settle_${order.id}`,
        notes: `%85 Influencer hakediş banka ödemesi tamamlandı (${order.payoutTransactionRef})`,
        createdBy: req.actorId,
      });
    }

    if (req.targetStatus === "REFUNDED") {
      if (!req.bankTransactionRef) {
        throw new Error("[REFUND_REF_REQUIRED] Refund bank reference ID is required.");
      }
      this.ledger.appendEntry({
        orderId: order.id,
        orderCode: order.orderCode,
        entryType: "REFUND_ISSUED",
        amountMinorUnits: order.snapshot.grossAmountMinorUnits,
        currency: order.snapshot.currency,
        direction: "DEBIT",
        bankReferenceId: req.bankTransactionRef,
        idempotencyKey: req.idempotencyKey || `refund_${order.id}`,
        notes: `Sipariş iptal/uyuşmazlık iadesi tamamlandı (${req.bankTransactionRef})`,
        createdBy: req.actorId,
      });
    }

    return order;
  }

  private recordEvent(params: {
    order: OrderRecord;
    actorId: string;
    actorRole: UserRole | "SYSTEM";
    previousStatus: OrderStatus | null;
    newStatus: OrderStatus;
    reason: string;
    referenceFileUrl?: string;
    bankReferenceId?: string;
  }): void {
    const event: OrderEventRecord = {
      id: `evt_${this.events.length + 1}`,
      tenantId: INFLUNEX_TENANT_ID,
      orderId: params.order.id,
      orderCode: params.order.orderCode,
      advertiserId: params.order.advertiserId,
      creatorId: params.order.creatorId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      reason: params.reason,
      referenceFileUrl: params.referenceFileUrl,
      bankReferenceId: params.bankReferenceId,
      createdAt: new Date().toISOString(),
    };
    this.events.push(Object.freeze(event));
  }
}
