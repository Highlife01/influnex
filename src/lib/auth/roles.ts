import type { UserRole } from "../types/domain";

export const SUPER_ADMIN_EMAIL = "cebrailkara@gmail.com";

type AccountRole = Extract<UserRole, "ADVERTISER" | "CREATOR">;

export function isSuperAdminEmail(
  email?: string | null,
  configuredSuperAdminEmail: string = SUPER_ADMIN_EMAIL
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === SUPER_ADMIN_EMAIL ||
    normalized === configuredSuperAdminEmail.trim().toLowerCase()
  );
}

export function resolveAccountRole(input: {
  email: string;
  superAdminEmail?: string;
  storedRole: unknown;
  requestedRole: AccountRole;
}): UserRole {
  if (isSuperAdminEmail(input.email, input.superAdminEmail || SUPER_ADMIN_EMAIL)) {
    return "ADMIN";
  }

  if (input.storedRole === "ADVERTISER" || input.storedRole === "CREATOR") {
    return input.storedRole;
  }

  return input.requestedRole;
}
