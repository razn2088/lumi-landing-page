import { describe, it, expect } from "vitest";
import { slugifyBrandId, deriveWpApiBase, validateBrandInput } from "../lib/brands-admin";

describe("slugifyBrandId", () => {
  it("slugifies a display name", () => {
    expect(slugifyBrandId("Top Deals US", [])).toBe("topdealsus");
  });
  it("suffixes on collision", () => {
    expect(slugifyBrandId("Top Deals US", ["topdealsus"])).toBe("topdealsus-2");
    expect(slugifyBrandId("Top Deals US", ["topdealsus", "topdealsus-2"])).toBe("topdealsus-3");
  });
  it("falls back to 'brand' when nothing slugifiable remains", () => {
    expect(slugifyBrandId("!!!", [])).toBe("brand");
  });
});

describe("deriveWpApiBase", () => {
  it("appends the wp-json path", () => {
    expect(deriveWpApiBase("https://x.com")).toBe("https://x.com/wp-json/wp/v2");
  });
  it("strips a trailing slash first", () => {
    expect(deriveWpApiBase("https://x.com/")).toBe("https://x.com/wp-json/wp/v2");
  });
});

describe("validateBrandInput", () => {
  const ok = { name: "X", siteUrl: "https://x.com", niche: "n", tone: "t" };
  it("returns null when valid", () => {
    expect(validateBrandInput(ok)).toBeNull();
  });
  it("requires each field", () => {
    expect(validateBrandInput({ ...ok, name: " " })?.field).toBe("name");
    expect(validateBrandInput({ ...ok, niche: "" })?.field).toBe("niche");
    expect(validateBrandInput({ ...ok, tone: "" })?.field).toBe("tone");
  });
  it("rejects a non-URL site", () => {
    expect(validateBrandInput({ ...ok, siteUrl: "not a url" })?.field).toBe("siteUrl");
  });
});
