import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/tr"); });

test("filters the catalog and recovers from an empty result", async ({ page }) => {
  await page.getByRole("group", { name: "Kategori filtresi" }).getByRole("button", { name: "Güzellik", exact: true }).click();
  await expect(page.locator(".creator-card")).toHaveCount(1);
  await expect(page.locator(".creator-card")).toContainText("Selin Y.");
  await page.getByLabel("Platform filtresi", { exact: true }).selectOption("YouTube");
  await expect(page.getByText("Bu seçimlerle eşleşen profil yok.")).toBeVisible();
  await page.getByRole("button", { name: "Filtreleri temizle" }).click();
  await expect(page.locator(".creator-card")).toHaveCount(6);
});

test("persists favorites and compares up to three profiles", async ({ page }) => {
  await page.getByRole("button", { name: "Ada K. favorilere ekle" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Ada K. favorilerden çıkar" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Favorilerim (1)" }).click();
  await expect(page.locator(".creator-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Favorilerim (1)" }).click();
  for (const name of ["Ada K.", "Emre A.", "Deniz S."]) await page.getByRole("checkbox", { name: `Karşılaştır: ${name}` }).check();
  await page.getByRole("checkbox", { name: "Karşılaştır: Selin Y." }).click();
  await expect(page.getByRole("checkbox", { name: "Karşılaştır: Selin Y." })).not.toBeChecked();
  await expect(page.getByText("Aynı anda en fazla 3 profili", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Karşılaştır", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("table")).toContainText("Deniz S.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("plans a brief from a profile, restores it and downloads a file", async ({ page }) => {
  await page.locator(".creator-card").first().getByRole("button", { name: "Profili incele" }).click();
  await page.getByRole("button", { name: "Bu profille brief planla" }).click();
  await expect(page.locator(".selected-creator")).toContainText("Ada K.");
  await page.getByRole("button", { name: "Yeni ürün lansmanı", exact: false }).click();
  await page.getByLabel("Marka adı", { exact: true }).fill("Test markası");
  await page.getByLabel("Ürün veya hizmet").fill("Yaz koleksiyonu");
  await page.getByLabel("Hedef kitle").fill("25–35 yaş, İstanbul");
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await page.getByLabel("Hedef teslim tarihi").fill(futureDate);
  await page.getByRole("button", { name: "Taslağı kaydet" }).click();
  await expect(page.getByText("Taslak bu tarayıcıya kaydedildi.", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Marka adı", { exact: true })).toHaveValue("Test markası");
  await expect(page.getByLabel("Kampanya başlığı")).toHaveValue("Yeni ürün lansman kampanyası");
  await expect(page.locator(".selected-creator")).toContainText("Ada K.");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Brief’i indir" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("influnex-kampanya-brief.txt");
});

test("supports role switching, FAQs and mobile navigation without overflow", async ({ page }, testInfo) => {
  await page.getByRole("button", { name: "İçerik üreticisiyim", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tarzını ortaya koy" })).toBeVisible();
  await page.getByText("UGC içerik ile influencer yayını arasındaki fark ne?", { exact: true }).click();
  await expect(page.locator("details[open]")).toContainText("kendi sosyal medya hesabında");
  if (testInfo.project.name === "mobile-chrome") {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await page.locator("#mobile-navigation").getByRole("link", { name: "Brief oluştur" }).click();
    await expect(page.getByRole("button", { name: "Menüyü aç" })).toHaveAttribute("aria-expanded", "false");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
