import { describe, expect, it } from "vitest";
import { demoCreators, filterCreators, type DiscoveryFilters } from "./catalog";

const defaults: DiscoveryFilters = { query: "", category: "Tümü", platform: "", city: "", maxPrice: 10000, favoritesOnly: false, favoriteIds: [], sort: "recommended" };

describe("creator discovery", () => {
  it("combines category, platform, city and inclusive budget filters", () => {
    const filters = { ...defaults, category: "Güzellik", platform: "UGC", city: "İstanbul", maxPrice: 3500 };
    expect(filterCreators(demoCreators, filters).map((c) => c.id)).toEqual(["demo-selin"]);
    expect(filterCreators(demoCreators, { ...filters, maxPrice: 3499 })).toHaveLength(0);
    expect(filterCreators(demoCreators, { ...filters, platform: "YouTube" })).toHaveLength(0);
  });
  it("handles Turkish casing and trims the search query", () => {
    expect(filterCreators(demoCreators, { ...defaults, query: " İSTANBUL " }).map((c) => c.id)).toEqual(["demo-ada", "demo-selin"]);
    expect(filterCreators(demoCreators, { ...defaults, query: "güzellİk" }).map((c) => c.id)).toEqual(["demo-selin"]);
  });
  it("intersects favorites with other filters", () => {
    expect(filterCreators(demoCreators, { ...defaults, favoritesOnly: true })).toHaveLength(0);
    const filters = { ...defaults, favoritesOnly: true, favoriteIds: ["demo-ada", "demo-emre"], platform: "UGC" };
    expect(filterCreators(demoCreators, filters).map((c) => c.id)).toEqual(["demo-ada"]);
  });
  it("sorts results without changing the shared catalog", () => {
    const original = demoCreators.map((c) => c.id);
    const byPrice = filterCreators(demoCreators, { ...defaults, sort: "price-asc" });
    expect(byPrice.map((c) => c.price)).toEqual([1500, 2500, 3500, 4500, 5000, 6000]);
    expect(filterCreators(demoCreators, { ...defaults, sort: "delivery" })[0]?.id).toBe("demo-deniz");
    expect(demoCreators.map((c) => c.id)).toEqual(original);
  });
});
