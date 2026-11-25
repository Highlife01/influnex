import { expect, test } from "@playwright/test";

test.describe("InfluNex Unified Multilingual Discovery, Detail & Auth Flows", () => {
  test("renders Turkish canonical homepage with dual-role CTAs and AI search", async ({
    page,
  }) => {
    await page.goto("/tr");
    await expect(page.locator("h1")).toContainText(
      "Markalar ve içerik üreticileri burada buluşuyor."
    );
    await expect(
      page.getByRole("link", { name: /Influencer Bul/i }).first()
    ).toBeVisible();
  });

  test("preserves English locale links across navigation on /en", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toContainText(
      "Where brands and content creators connect."
    );
    const exploreLink = page
      .getByRole("link", { name: /Explore Creators/i })
      .first();
    await expect(exploreLink).toHaveAttribute("href", "/en/creators");
  });

  test("renders creator profile detail with 6-row usage rights and 3-column commission breakdown", async ({
    page,
  }) => {
    await page.goto("/tr/influencer/mert-demir-tech");
    await expect(page.locator("h1")).toContainText("Mert Demir Tech");
    await expect(
      page.getByText("Toplam Hizmet Bedeli (Brüt)").first()
    ).toBeVisible();
    await expect(
      page.getByText("Üretici Brüt Payı (%85)").first()
    ).toBeVisible();
  });

  test("serves crawlable robots.txt and sitemap.xml for Googlebot", async ({
    request,
  }) => {
    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain("Allow: /");
    expect(robotsText).toContain("Sitemap: https://www.influnex.com.tr/sitemap.xml");

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain("<sitemapindex");
  });
});
