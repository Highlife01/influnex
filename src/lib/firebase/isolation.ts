/**
 * INFLUNEX 4-LAYER DATA ISOLATION MODULE
 * Ensures complete physical and logical separation on Firebase project `karacateknik-b202f`
 * so that InfluNex never touches `(default)`, `ilanturkiye` (FirmaNex), or `kuzeydenizi-db`.
 */

export const INFLUNEX_TENANT_ID = "influnex" as const;
export const INFLUNEX_FIREBASE_PROJECT_ID = "karacateknik-b202f" as const;
export const INFLUNEX_HOSTING_SITE_ID = "influnex" as const;
export const INFLUNEX_FIRESTORE_DATABASE_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID ||
  process.env.FIRESTORE_DATABASE_ID ||
  "influnex-db";
export const INFLUNEX_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gs://influnex-b202f";
export const INFLUNEX_COLLECTION_PREFIX = "influnex_" as const;
export const INFLUNEX_STORAGE_ROOT_PREFIX = "influnex" as const;
export const INFLUNEX_LOCAL_STORAGE_PREFIX = "influnex_v1_" as const;

export const LOGICAL_COLLECTIONS = [
  "users",
  "publicCreatorProfiles",
  "privateCreatorProfiles",
  "advertiserProfiles",
  "socialAccounts",
  "categories",
  "countries",
  "cities",
  "services",
  "campaigns",
  "proposals",
  "orders",
  "orderEvents",
  "paymentRecords",
  "payoutRecords",
  "financialLedger",
  "conversations",
  "messages",
  "notifications",
  "reviews",
  "disputes",
  "reports",
  "documents",
  "seoPages",
  "blogPosts",
  "redirects",
  "platformSettings",
  "adminAuditLogs",
  "consentRecords",
  "verificationRequests",
] as const;

export type LogicalCollectionName = (typeof LOGICAL_COLLECTIONS)[number];
export type IsolatedCollectionName = `${typeof INFLUNEX_COLLECTION_PREFIX}${LogicalCollectionName}`;

/**
 * Maps a logical collection name to its physically isolated collection name (`influnex_<name>`).
 */
export function getIsolatedCollectionName<T extends LogicalCollectionName>(
  logicalName: T
): `${typeof INFLUNEX_COLLECTION_PREFIX}${T}` {
  if (!LOGICAL_COLLECTIONS.includes(logicalName)) {
    throw new Error(`Invalid logical collection name: ${String(logicalName)}`);
  }
  return `${INFLUNEX_COLLECTION_PREFIX}${logicalName}`;
}

/**
 * Stamps every document written by InfluNex with the immutable `tenantId: "influnex"`.
 */
export function withTenantIsolation<T extends Record<string, unknown>>(
  payload: T
): T & { tenantId: typeof INFLUNEX_TENANT_ID } {
  return {
    ...payload,
    tenantId: INFLUNEX_TENANT_ID,
  };
}

/**
 * Verifies that a document retrieved from storage/database belongs exclusively to the `influnex` tenant.
 */
export function assertTenantIsolation(
  doc: { tenantId?: unknown } | null | undefined,
  context = "document"
): void {
  if (!doc || doc.tenantId !== INFLUNEX_TENANT_ID) {
    throw new Error(
      `[DataIsolationViolation] Cross-tenant access blocked on ${context}. Expected tenantId="${INFLUNEX_TENANT_ID}".`
    );
  }
}

/**
 * Builds an isolated Cloud Storage path under `/influnex/{visibility}/...`
 */
export function getIsolatedStoragePath(
  visibility: "public" | "private",
  category: "creators" | "receipts" | "deliverables",
  ownerUid: string,
  fileName: string,
  orderId?: string
): string {
  const safeOwner = ownerUid.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFile = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!safeOwner || !safeFile) {
    throw new Error("Invalid storage path parameters");
  }
  if (visibility === "private" && orderId) {
    const safeOrder = orderId.replace(/[^a-zA-Z0-9_-]/g, "");
    return `${INFLUNEX_STORAGE_ROOT_PREFIX}/${visibility}/${category}/${safeOwner}/${safeOrder}/${safeFile}`;
  }
  return `${INFLUNEX_STORAGE_ROOT_PREFIX}/${visibility}/${category}/${safeOwner}/${safeFile}`;
}

export const PUBLIC_PROFILE_FORBIDDEN_PII_FIELDS = [
  "iban",
  "nationalId",
  "taxId",
  "phone",
  "privateEmail",
  "bankAccountHolder",
  "birthDate",
] as const;

/**
 * Strips and rejects any private PII or banking fields before saving to `influnex_publicCreatorProfiles`.
 */
export function enforcePublicProfileDataIsolation<T extends Record<string, unknown>>(
  profileData: T
): T {
  for (const field of PUBLIC_PROFILE_FORBIDDEN_PII_FIELDS) {
    if (field in profileData && profileData[field] !== undefined) {
      throw new Error(
        `[PII_ISOLATION_ERROR] Field "${field}" is forbidden in publicCreatorProfiles and must be stored in privateCreatorProfiles.`
      );
    }
  }
  return profileData;
}
