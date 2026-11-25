import type { UserRole } from "../types/domain";

type AccountRole = Extract<UserRole, "ADVERTISER" | "CREATOR">;

export function resolveAccountRole(input: {
  email: string;
  superAdminEmail: string;
  storedRole: unknown;
  requestedRole: AccountRole;
}): UserRole {
  if (input.email.trim().toLowerCase() === input.superAdminEmail.trim().toLowerCase()) {
    return "ADMIN";
  }

  if (input.storedRole === "ADVERTISER" || input.storedRole === "CREATOR") {
    return input.storedRole;
  }

  return input.requestedRole;
}
