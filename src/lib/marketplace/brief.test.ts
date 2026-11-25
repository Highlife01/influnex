import { describe, expect, it } from "vitest";
import { BriefDraftSchema, briefToText, emptyBrief } from "./brief";

describe("local brief drafts", () => {
  it("rejects corrupt storage, unsupported versions and invalid budgets", () => {
    for (const value of [null, [], { ...emptyBrief, version: 2 }, { ...emptyBrief, budget: -1 }, { ...emptyBrief, budget: 500.25 }, { ...emptyBrief, budget: 1000001 }, { ...emptyBrief, platform: "unknown" }, { ...emptyBrief, deliveryDate: "2027-02-30" }, { ...emptyBrief, goal: "influencer", platform: "UGC" }]) {
      expect(BriefDraftSchema.safeParse(value).success).toBe(false);
    }
    expect(BriefDraftSchema.safeParse(emptyBrief).success).toBe(true);
  });
  it("exports the complete brief and explicitly labels demo selection and draft status", () => {
    const draft = { ...emptyBrief, brand: "Deneme Marka", title: "Yaz lansmanı", product: "Güneş gözlüğü", audience: "25–35 yaş", deliverables: "1 Reels, 1 revizyon", deliveryDate: "2027-06-01", usage: "ads-90" as const };
    const text = briefToText(draft, "Ada K.");
    for (const value of [draft.brand, draft.title, draft.product, draft.audience, draft.deliverables, draft.deliveryDate, "90 gün", "Ada K. (demo)", "kampanya yayınlanmamış", "%15"]) expect(text).toContain(value);
    expect(briefToText(draft)).toContain("henüz seçilmedi");
  });
});
