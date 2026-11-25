import { describe, expect, it } from "vitest";
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  resolveAccountRole,
} from "./roles";

describe("resolveAccountRole & SuperAdmin", () => {
  const superAdminEmail = SUPER_ADMIN_EMAIL;

  it("identifies cebrailkara@gmail.com as SuperAdmin case-insensitively", () => {
    expect(SUPER_ADMIN_EMAIL).toBe("cebrailkara@gmail.com");
    expect(isSuperAdminEmail("cebrailkara@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("  CebrailKara@GMAIL.com ")).toBe(true);
    expect(isSuperAdminEmail("other@gmail.com")).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
  });

  it("assigns admin only to the configured superadmin email", () => {
    expect(
      resolveAccountRole({
        email: "CebrailKara@gmail.com",
        superAdminEmail,
        storedRole: null,
        requestedRole: "CREATOR",
      }),
    ).toBe("ADMIN");
  });

  it("keeps an existing advertiser account from switching roles", () => {
    expect(
      resolveAccountRole({
        email: "creator@example.com",
        superAdminEmail,
        storedRole: "ADVERTISER",
        requestedRole: "CREATOR",
      }),
    ).toBe("ADVERTISER");
  });

  it("does not accept an admin role stored for a non-superadmin", () => {
    expect(
      resolveAccountRole({
        email: "user@example.com",
        superAdminEmail,
        storedRole: "ADMIN",
        requestedRole: "CREATOR",
      }),
    ).toBe("CREATOR");
  });
});
