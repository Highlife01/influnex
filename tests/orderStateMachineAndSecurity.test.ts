import { describe, expect, it, vi } from "vitest";

const { verifyIdTokenMock } = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  FirebaseAdminConfigurationError: class FirebaseAdminConfigurationError extends Error {},
  getInfluNexAdminServices: () => ({
    auth: { verifyIdToken: verifyIdTokenMock },
    firestore: {},
  }),
}));
import {
  assertTenantIsolation,
  enforcePublicProfileDataIsolation,
  getIsolatedCollectionName,
  getIsolatedStoragePath,
  INFLUNEX_FIRESTORE_DATABASE_ID,
  withTenantIsolation,
} from "@/lib/firebase/isolation";
import { OrderStateMachineEngine } from "@/lib/orders/stateMachine";
import { validateReceiptUpload } from "@/lib/security/fileValidator";
import {
  assertAdminRole,
  assertOrderAccess,
  assertPrivateProfileAccess,
} from "@/lib/security/rbac";
import { validateExternalBrandUrl } from "@/lib/security/ssrfGuard";
import {
  appendApiMutationAuditLog,
  getApiMutationAuditTrail,
  verifyApiMutationRequest,
} from "@/lib/security/apiGuard";
import { UserRegistrationSchema } from "@/lib/validators/schemas";

describe("InfluNex Order State Machine, Data Isolation & Security Controls", () => {
  it("enforces 4-layer data isolation on karacateknik-b202f (influnex-db & influnex_ prefix & PII separation)", () => {
    expect(INFLUNEX_FIRESTORE_DATABASE_ID).toBe("influnex-db");
    expect(getIsolatedCollectionName("users")).toBe("influnex_users");
    expect(getIsolatedCollectionName("publicCreatorProfiles")).toBe(
      "influnex_publicCreatorProfiles"
    );
    expect(getIsolatedCollectionName("privateCreatorProfiles")).toBe(
      "influnex_privateCreatorProfiles"
    );
    expect(getIsolatedCollectionName("financialLedger")).toBe(
      "influnex_financialLedger"
    );

    const stamped = withTenantIsolation({ username: "emre-toros-oto" });
    expect(stamped.tenantId).toBe("influnex");
    expect(() => assertTenantIsolation(stamped)).not.toThrow();
    expect(() =>
      assertTenantIsolation({ tenantId: "other_project" })
    ).toThrow(/DataIsolationViolation/);

    // Forbid IBAN, phone, or nationalId inside publicCreatorProfiles
    expect(() =>
      enforcePublicProfileDataIsolation({
        username: "test-user",
        iban: "TR000000000000000000000000",
      })
    ).toThrow(/PII_ISOLATION_ERROR/);

    const storagePath = getIsolatedStoragePath(
      "private",
      "receipts",
      "adv_1",
      "dekont.pdf",
      "ord_1"
    );
    expect(storagePath).toBe("influnex/private/receipts/adv_1/ord_1/dekont.pdf");
  });

  it("enforces 18+ age requirement on creator registration while allowing advertiser signup", () => {
    const underageCreator = UserRegistrationSchema.safeParse({
      email: "genc@ornek.com",
      displayName: "Genç Üretici",
      role: "CREATOR",
      birthYear: 2012,
      acceptedTermsVersion: "v1.0",
    });
    expect(underageCreator.success).toBe(false);

    const adultCreator = UserRegistrationSchema.safeParse({
      email: "yetiskin@ornek.com",
      displayName: "Yetişkin Üretici",
      role: "CREATOR",
      birthYear: 1998,
      acceptedTermsVersion: "v1.0",
    });
    expect(adultCreator.success).toBe(true);

    const advertiser = UserRegistrationSchema.safeParse({
      email: "marka@firma.com",
      displayName: "Toros Otomotiv",
      role: "ADVERTISER",
      acceptedTermsVersion: "v1.0",
    });
    expect(advertiser.success).toBe(true);
  });

  it("executes full 15-state order lifecycle, prevents duplicate bank refs, and blocks unauthorized IDOR access", () => {
    const engine = new OrderStateMachineEngine();

    const order = engine.createOrder({
      sourceType: "DIRECT_SERVICE",
      advertiserId: "adv_100",
      advertiserBrandName: "Toros Auto Care",
      creatorId: "cr_200",
      creatorUsername: "emre-toros-oto",
      serviceId: "srv_1",
      serviceTitle: "Instagram Reels Otomotiv İncelemesi",
      platform: "INSTAGRAM",
      grossAmountMinorUnits: 1000000, // 10.000 TL
      deliveryDays: 4,
      maxRevisions: 1,
      usageRights: "1 yıl organik kullanım",
      paidAdsReuseAllowed: true,
      acceptedTermsVersion: "v1.0-DRAFT",
    });

    expect(order.orderCode).toBe("INF-2026-000001");
    expect(order.status).toBe("PAYMENT_PENDING");
    expect(order.snapshot.platformCommissionMinorUnits).toBe(150000); // 1.500 TL
    expect(order.snapshot.creatorNetPayoutMinorUnits).toBe(850000); // 8.500 TL

    // Another user cannot view or transition this order (IDOR block)
    expect(() =>
      assertOrderAccess(
        { uid: "intruder_999", role: "ADVERTISER", emailVerified: true },
        order
      )
    ).toThrow(/IDOR_BLOCKED/);

    expect(() =>
      assertPrivateProfileAccess(
        { uid: "intruder_999", role: "CREATOR", emailVerified: true },
        "cr_200"
      )
    ).toThrow(/IDOR_BLOCKED/);

    expect(() =>
      assertAdminRole({ uid: "cr_200", role: "CREATOR", emailVerified: true })
    ).toThrow(/RBAC_FORBIDDEN/);

    // 1. Advertiser uploads receipt -> PAYMENT_REVIEW
    engine.transition({
      orderId: order.id,
      actorId: "adv_100",
      actorRole: "ADVERTISER",
      targetStatus: "PAYMENT_REVIEW",
      reason: "Havale dekontu yüklendi",
      receiptFilePath: "influnex/private/receipts/adv_100/ord_1/dekont.pdf",
    });
    expect(engine.getOrder(order.id)?.status).toBe("PAYMENT_REVIEW");

    // Advertiser cannot self-approve payment
    expect(() =>
      engine.transition({
        orderId: order.id,
        actorId: "adv_100",
        actorRole: "ADVERTISER",
        targetStatus: "PAID",
        reason: "Kendi ödememi onaylıyorum",
        bankTransactionRef: "EFT-2026-9001",
      })
    ).toThrow(/UNAUTHORIZED_ROLE_TRANSITION/);

    // 2. Admin approves bank transfer -> PAID
    engine.transition({
      orderId: order.id,
      actorId: "admin_1",
      actorRole: "ADMIN",
      targetStatus: "PAID",
      reason: "Banka hesabında 10.000 TL FAST tahsilatı doğrulandı",
      bankTransactionRef: "EFT-2026-9001",
      paidAmountMinorUnits: 1000000,
    });
    expect(engine.getOrder(order.id)?.status).toBe("PAID");

    // Duplicate bank reference on a second order must be blocked
    const order2 = engine.createOrder({
      sourceType: "DIRECT_SERVICE",
      advertiserId: "adv_100",
      advertiserBrandName: "Toros Auto Care",
      creatorId: "cr_200",
      creatorUsername: "emre-toros-oto",
      serviceId: "srv_1",
      serviceTitle: "Instagram Story",
      platform: "INSTAGRAM",
      grossAmountMinorUnits: 450000,
      deliveryDays: 2,
      maxRevisions: 1,
      usageRights: "24 saat",
      paidAdsReuseAllowed: false,
      acceptedTermsVersion: "v1.0-DRAFT",
    });
    engine.transition({
      orderId: order2.id,
      actorId: "adv_100",
      actorRole: "ADVERTISER",
      targetStatus: "PAYMENT_REVIEW",
      reason: "Dekont yüklendi",
      receiptFilePath: "influnex/private/receipts/adv_100/ord_2/dekont.pdf",
    });
    expect(() =>
      engine.transition({
        orderId: order2.id,
        actorId: "admin_1",
        actorRole: "ADMIN",
        targetStatus: "PAID",
        reason: "Aynı banka referansı ile ikinci onay denemesi",
        bankTransactionRef: "EFT-2026-9001",
      })
    ).toThrow(/DUPLICATE_BANK_TRANSFER_REF/);

    // 3. Creator starts work -> IN_PROGRESS
    engine.transition({
      orderId: order.id,
      actorId: "cr_200",
      actorRole: "CREATOR",
      targetStatus: "IN_PROGRESS",
      reason: "Çekim hazırlığına başlandı",
    });

    // 4. Creator submits content -> CONTENT_SUBMITTED
    engine.transition({
      orderId: order.id,
      actorId: "cr_200",
      actorRole: "CREATOR",
      targetStatus: "CONTENT_SUBMITTED",
      reason: "İlk kurgu hazırlandı",
      submittedContentUrl: "https://firebasestorage.googleapis.com/v0/b/influnex-b202f/o/draft1.mp4",
    });

    // 5. Advertiser requests revision -> REVISION_REQUESTED
    engine.transition({
      orderId: order.id,
      actorId: "adv_100",
      actorRole: "ADVERTISER",
      targetStatus: "REVISION_REQUESTED",
      reason: "Son ekrana ürün web sitesi altyazısı eklensin",
    });

    // 6. Creator submits revised content -> CONTENT_SUBMITTED
    engine.transition({
      orderId: order.id,
      actorId: "cr_200",
      actorRole: "CREATOR",
      targetStatus: "CONTENT_SUBMITTED",
      reason: "Revizyon tamamlandı",
      submittedContentUrl: "https://firebasestorage.googleapis.com/v0/b/influnex-b202f/o/draft2.mp4",
    });

    // Exceeding maxRevisions (1) is blocked
    expect(() =>
      engine.transition({
        orderId: order.id,
        actorId: "adv_100",
        actorRole: "ADVERTISER",
        targetStatus: "REVISION_REQUESTED",
        reason: "İkinci revizyon talebi",
      })
    ).toThrow(/MAX_REVISIONS_EXCEEDED/);

    // 7. Advertiser approves content -> CONTENT_APPROVED
    engine.transition({
      orderId: order.id,
      actorId: "adv_100",
      actorRole: "ADVERTISER",
      targetStatus: "CONTENT_APPROVED",
      reason: "İçerik onaylandı, yayına alınabilir",
    });

    // 8. Creator publishes post: must confirm Ticaret Bakanlığı #reklam disclosure
    expect(() =>
      engine.transition({
        orderId: order.id,
        actorId: "cr_200",
        actorRole: "CREATOR",
        targetStatus: "PUBLISHED",
        reason: "Yayınlandı ama etiket onaylanmadı",
        publishedPostUrl: "https://instagram.com/p/ABC123",
        sponsorDisclosureConfirmed: false,
      })
    ).toThrow(/SPONSOR_DISCLOSURE_REQUIRED/);

    engine.transition({
      orderId: order.id,
      actorId: "cr_200",
      actorRole: "CREATOR",
      targetStatus: "PUBLISHED",
      reason: "#reklam etiketiyle yayınlandı",
      publishedPostUrl: "https://instagram.com/p/ABC123",
      sponsorDisclosureConfirmed: true,
    });

    // 9. Advertiser completes order -> COMPLETED -> auto transitions to PAYOUT_PENDING
    engine.transition({
      orderId: order.id,
      actorId: "adv_100",
      actorRole: "ADVERTISER",
      targetStatus: "COMPLETED",
      reason: "Yayın kontrol edildi, sipariş tamamlandı",
    });
    expect(engine.getOrder(order.id)?.status).toBe("PAYOUT_PENDING");

    // 10. Admin records manual bank payout -> PAYOUT_COMPLETED
    engine.transition({
      orderId: order.id,
      actorId: "admin_1",
      actorRole: "ADMIN",
      targetStatus: "PAYOUT_COMPLETED",
      reason: "%85 influencer hakedişi (8.500 TL) banka hesabına gönderildi",
      payoutTransactionRef: "PAYOUT-FAST-7741",
    });
    expect(engine.getOrder(order.id)?.status).toBe("PAYOUT_COMPLETED");

    const ledgerEntries = engine.ledger.getEntriesForOrder(order.id);
    expect(ledgerEntries.map((e) => e.entryType)).toEqual([
      "PAYMENT_COLLECTED",
      "COMMISSION_RECOGNIZED",
      "CREATOR_PAYOUT_ACCRUED",
      "CREATOR_PAYOUT_SETTLED",
    ]);
  });

  it("handles order dispute and refund lifecycle cleanly", () => {
    const engine = new OrderStateMachineEngine();
    const order = engine.createOrder({
      sourceType: "DIRECT_SERVICE",
      advertiserId: "adv_1",
      advertiserBrandName: "Marka A",
      creatorId: "cr_1",
      creatorUsername: "uretici-a",
      serviceId: "srv_1",
      serviceTitle: "TikTok Video",
      platform: "TIKTOK",
      grossAmountMinorUnits: 300000,
      deliveryDays: 3,
      maxRevisions: 1,
      usageRights: "Organik",
      paidAdsReuseAllowed: false,
      acceptedTermsVersion: "v1.0",
    });

    engine.transition({
      orderId: order.id,
      actorId: "adv_1",
      actorRole: "ADVERTISER",
      targetStatus: "PAYMENT_REVIEW",
      reason: "Dekont yüklendi",
      receiptFilePath: "influnex/private/receipts/adv_1/ord_1/dekont.pdf",
    });
    engine.transition({
      orderId: order.id,
      actorId: "admin_1",
      actorRole: "ADMIN",
      targetStatus: "PAID",
      reason: "Onaylandı",
      bankTransactionRef: "REF-DISPUTE-01",
    });
    engine.transition({
      orderId: order.id,
      actorId: "adv_1",
      actorRole: "ADVERTISER",
      targetStatus: "DISPUTED",
      reason: "Teslim süresi aşıldı",
    });
    engine.transition({
      orderId: order.id,
      actorId: "admin_1",
      actorRole: "ADMIN",
      targetStatus: "REFUND_PENDING",
      reason: "İade onaylandı",
    });
    engine.transition({
      orderId: order.id,
      actorId: "admin_1",
      actorRole: "ADMIN",
      targetStatus: "REFUNDED",
      reason: "Banka iadesi yapıldı",
      bankTransactionRef: "REFUND-BANK-01",
    });
    expect(engine.getOrder(order.id)?.status).toBe("REFUNDED");
  });

  it("validates receipt uploads (PDF/JPG/PNG magic bytes, 5MB limit, and malicious XSS content scan)", () => {
    const validPdf = validateReceiptUpload({
      fileName: "dekont-2026.pdf",
      mimeType: "application/pdf",
      sizeBytes: 240_000,
      headerBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]),
    });
    expect(validPdf.valid).toBe(true);

    const fakePdfWithExeHeader = validateReceiptUpload({
      fileName: "malware.pdf",
      mimeType: "application/pdf",
      sizeBytes: 120_000,
      headerBytes: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]), // MZ header
    });
    expect(fakePdfWithExeHeader.valid).toBe(false);
    expect(fakePdfWithExeHeader.reason).toBe("INVALID_PDF_MAGIC_BYTES");

    const maliciousScriptInPdf = validateReceiptUpload({
      fileName: "xss.pdf",
      mimeType: "application/pdf",
      sizeBytes: 50_000,
      headerBytes: new TextEncoder().encode("%PDF-1.7 <script>alert(1)</script>"),
    });
    expect(maliciousScriptInPdf.valid).toBe(false);
    expect(maliciousScriptInPdf.reason).toBe("MALICIOUS_ACTIVE_CONTENT_DETECTED");

    const oversizedFile = validateReceiptUpload({
      fileName: "big.png",
      mimeType: "image/png",
      sizeBytes: 6 * 1024 * 1024,
      headerBytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    });
    expect(oversizedFile.valid).toBe(false);
    expect(oversizedFile.reason).toBe("FILE_TOO_LARGE_MAX_5MB");
  });

  it("blocks SSRF internal/private IPs, verifies API mutation identity and role, and records audit logs", async () => {
    expect(validateExternalBrandUrl("http://localhost:3000").valid).toBe(false);
    expect(validateExternalBrandUrl("https://127.0.0.1/admin").valid).toBe(false);
    expect(
      validateExternalBrandUrl("https://169.254.169.254/latest/meta-data").valid
    ).toBe(false);
    expect(validateExternalBrandUrl("https://192.168.1.15/config").valid).toBe(
      false
    );
    expect(
      validateExternalBrandUrl("https://www.firmanex.com.tr").valid
    ).toBe(true);

    const badOriginReq = new Request("https://www.influnex.com.tr/api/v1/campaigns", {
      method: "POST",
      headers: {
        origin: "https://evil-attacker.example.com",
        "x-actor-uid": "adv_1",
        "x-actor-role": "ADVERTISER",
      },
    });
    const csrfResult = await verifyApiMutationRequest(badOriginReq, {
      endpoint: "/api/v1/campaigns",
      action: "CREATE_CAMPAIGN",
      allowedRoles: ["ADVERTISER"],
    });
    expect(csrfResult.allowed).toBe(false);

    const forgedReq = new Request("https://www.influnex.com.tr/api/v1/campaigns", {
      method: "POST",
      headers: {
        origin: "https://www.influnex.com.tr",
        "x-actor-uid": "adv_1",
        "x-actor-role": "ADMIN",
      },
    });
    const forgedResult = await verifyApiMutationRequest(forgedReq, {
      endpoint: "/api/v1/campaigns",
      action: "CREATE_CAMPAIGN",
      allowedRoles: ["ADVERTISER"],
    });
    expect(forgedResult).toMatchObject({
      allowed: false,
      status: 401,
      error: "AUTHENTICATION_REQUIRED",
    });

    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "adv_1",
      role: "ADVERTISER",
      email_verified: true,
    });
    const validReq = new Request("https://www.influnex.com.tr/api/v1/campaigns", {
      method: "POST",
      headers: {
        origin: "https://www.influnex.com.tr",
        authorization: "Bearer signed-firebase-id-token",
      },
    });
    const okResult = await verifyApiMutationRequest(validReq, {
      endpoint: "/api/v1/campaigns",
      action: "CREATE_CAMPAIGN",
      allowedRoles: ["ADVERTISER"],
    });
    expect(okResult.allowed).toBe(true);

    appendApiMutationAuditLog({
      endpoint: "/api/v1/campaigns",
      actorUid: "adv_1",
      actorRole: "ADVERTISER",
      action: "CREATE_CAMPAIGN",
      metadata: { iban: "TR00112233", campaignId: "cmp_99" },
    });
    const trail = getApiMutationAuditTrail();
    expect(trail.length).toBeGreaterThan(0);
    expect(trail[trail.length - 1]?.metadata.iban).toBe("[REDACTED]");
  });
});
