import { describe, expect, it } from "vitest";
import { resolveAccountRole } from "./roles";

describe("resolveAccountRole", () => {
  const superAdminEmail = "cebrailkara@gmail.com";

  it("assigns admin only to the configured email", () => {
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
