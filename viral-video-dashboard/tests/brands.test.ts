import { describe, it, expect } from "vitest";
import { rowToBrand, resolveSelectedBrand, type BrandRow } from "../lib/brands";

describe("rowToBrand", () => {
  it("maps snake_case + coerces ig_enabled", () => {
    expect(rowToBrand({ id: "b1", name: "Top Deals US", logo_url: "l.png", brand_color: "#123", site_url: "https://x", ig_username: "topdeals.us", ig_enabled: true }))
      .toEqual({ id: "b1", name: "Top Deals US", logoUrl: "l.png", brandColor: "#123", siteUrl: "https://x", igUsername: "topdeals.us", igEnabled: true });
  });
  it("defaults missing fields", () => {
    const b = rowToBrand({ id: "b2" });
    expect(b.name).toBe("Untitled"); expect(b.logoUrl).toBeNull(); expect(b.igEnabled).toBe(false);
  });
});

describe("resolveSelectedBrand", () => {
  const brands: BrandRow[] = [
    { id: "b1", name: "A", logoUrl: null, brandColor: null, siteUrl: null, igUsername: null, igEnabled: false },
    { id: "b2", name: "B", logoUrl: null, brandColor: null, siteUrl: null, igUsername: null, igEnabled: false },
  ];
  it("returns matching brand when param valid", () => expect(resolveSelectedBrand(brands, "b2")?.id).toBe("b2"));
  it("falls back to first when param invalid", () => expect(resolveSelectedBrand(brands, "nope")?.id).toBe("b1"));
  it("falls back to first when no param", () => expect(resolveSelectedBrand(brands, undefined)?.id).toBe("b1"));
  it("null when no brands", () => expect(resolveSelectedBrand([], "b1")).toBeNull());
});
