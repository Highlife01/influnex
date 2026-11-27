import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/roles";

const {
  verifyIdTokenMock,
  setDocMock,
  deleteDocMock,
  getCollectionMock,
} = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
  setDocMock: vi.fn(),
  deleteDocMock: vi.fn(),
  getCollectionMock: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  FirebaseAdminConfigurationError: class FirebaseAdminConfigurationError extends Error {},
  getInfluNexAdminServices: () => ({
    auth: { verifyIdToken: verifyIdTokenMock },
    firestore: {
      collection: (name: string) => ({
        get: () => getCollectionMock(name),
        doc: (docId: string) => ({
          set: (data: unknown, opts?: unknown) => setDocMock(name, docId, data, opts),
          delete: () => deleteDocMock(name, docId),
        }),
      }),
    },
  }),
}));

import { GET, POST } from "@/app/api/v1/admin/workspace/route";
import { resetApiRateLimitBuckets } from "@/lib/security/apiGuard";

describe("Admin Workspace API (/api/v1/admin/workspace)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetApiRateLimitBuckets();
  });

  it("blocks unauthenticated and non-admin callers while granting universal access to cebrailkara@gmail.com", async () => {
    const unauthRes = await GET(
      new Request("https://www.influnex.com.tr/api/v1/admin/workspace")
    );
    expect(unauthRes.status).toBe(401);

    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "adv_1",
      email: "marka@ornek.com",
      email_verified: true,
      role: "ADVERTISER",
    });
    const forbiddenRes = await GET(
      new Request("https://www.influnex.com.tr/api/v1/admin/workspace", {
        headers: { authorization: "Bearer non-admin-token" },
      })
    );
    expect(forbiddenRes.status).toBe(403);

    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "superadmin_uid",
      email: SUPER_ADMIN_EMAIL,
      email_verified: true,
    });
    getCollectionMock.mockResolvedValue({ docs: [] });

    const okGet = await GET(
      new Request("https://www.influnex.com.tr/api/v1/admin/workspace", {
        headers: { authorization: "Bearer superadmin-token" },
      })
    );
    expect(okGet.status).toBe(200);
    const body = await okGet.json();
    expect(body.tenantId).toBe("influnex");
    expect(getCollectionMock).toHaveBeenCalledWith("influnex_orders");
    expect(getCollectionMock).toHaveBeenCalledWith("influnex_campaigns");
    expect(getCollectionMock).toHaveBeenCalledWith("influnex_publicCreatorProfiles");
    expect(getCollectionMock).toHaveBeenCalledWith("influnex_services");
  });

  it("allows SuperAdmin to upsert and delete real orders in influnex_orders with tenantId", async () => {
    verifyIdTokenMock.mockResolvedValue({
      uid: "superadmin_uid",
      email: SUPER_ADMIN_EMAIL,
      email_verified: true,
    });
    setDocMock.mockResolvedValueOnce(undefined);
    deleteDocMock.mockResolvedValueOnce(undefined);

    const postRes = await POST(
      new Request("https://www.influnex.com.tr/api/v1/admin/workspace", {
        method: "POST",
        headers: {
          origin: "https://www.influnex.com.tr",
          authorization: "Bearer superadmin-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "UPSERT_ORDER",
          order: {
            orderCode: "INF-2026-000001",
            brandName: "Gerçek Marka A.Ş.",
            creatorName: "Gül Koç (@guldkoc)",
            serviceTitle: "Instagram Reels Tanıtımı",
            grossTl: 3500,
            bankTransactionRef: "TR-FAST-998877",
            state: "PAYMENT_REVIEW",
            adDisclosureVerified: false,
            createdAt: "27.11.2026 23:10",
          },
        }),
      })
    );
    expect(postRes.status).toBe(200);
    expect(setDocMock).toHaveBeenCalledWith(
      "influnex_orders",
      "INF-2026-000001",
      expect.objectContaining({
        tenantId: "influnex",
        orderCode: "INF-2026-000001",
        updatedBy: "superadmin_uid",
      }),
      { merge: true }
    );

    const delRes = await POST(
      new Request("https://www.influnex.com.tr/api/v1/admin/workspace", {
        method: "POST",
        headers: {
          origin: "https://www.influnex.com.tr",
          authorization: "Bearer superadmin-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "DELETE_ORDER",
          orderCode: "INF-2026-000001",
        }),
      })
    );
    expect(delRes.status).toBe(200);
    expect(deleteDocMock).toHaveBeenCalledWith(
      "influnex_orders",
      "INF-2026-000001"
    );
  });
});
