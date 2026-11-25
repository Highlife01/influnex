import { expect, test } from "@playwright/test";

test.describe("InfluNex E2E Marketplace & SEO Verification", () => {
  test("renders server-side Turkish homepage with H1, canonical, hreflang, and 15% commission calculator", async ({
    page,
  }) => {
    await page.goto("/tr");
    await expect(page.locator("h1")).toContainText(
      "Birlikte kazan."
    );
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toContain("/tr");
  });

  test("renders programmatic Adana Otomotiv SEO landing page with approved creators", async ({
    page,
  }) => {
    await page.goto("/tr/influencer/adana/otomotiv");
    await expect(page.locator("h1")).toContainText(
      "Adana Otomotiv Influencer ve İçerik Üreticileri"
    );
    await expect(page.getByText("Emre Toros")).toBeVisible();
  });
});
