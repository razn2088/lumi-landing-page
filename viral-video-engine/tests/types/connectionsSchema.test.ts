import { describe, it, expect } from "vitest";
import { BrandSchema } from "../../src/types/domain.js";

describe("Brand.igUsername", () => {
  it("accepts an optional igUsername", () => {
    const b = BrandSchema.parse({ id: "topdealsus", name: "T", siteUrl: "https://t.com", wpApiBase: "https://t.com/api", igUsername: "topdealsus" });
    expect(b.igUsername).toBe("topdealsus");
    expect(BrandSchema.parse({ id: "x", name: "X", siteUrl: "https://x.com", wpApiBase: "https://x.com/api" }).igUsername).toBeUndefined();
  });
});
