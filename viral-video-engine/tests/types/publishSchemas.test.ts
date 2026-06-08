import { describe, it, expect } from "vitest";
import { BrandSchema, PostSchema } from "../../src/types/domain.js";

describe("publish schema fields", () => {
  it("Brand accepts optional IG fields and works without them", () => {
    const b = BrandSchema.parse({ id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com", wpApiBase: "https://topdealsus.com/wp-json/wp/v2" });
    expect(b.igUserId).toBeUndefined();
    expect(b.igEnabled).toBeUndefined();
    const b2 = BrandSchema.parse({ id: "x", name: "X", siteUrl: "https://x.com", wpApiBase: "https://x.com/api", igUserId: "123", igAccessToken: "tok", igEnabled: true });
    expect(b2.igUserId).toBe("123");
    expect(b2.igEnabled).toBe(true);
  });

  it("Post accepts optional publish-result fields", () => {
    const p = PostSchema.parse({
      id: "11111111-1111-1111-1111-111111111111", articleId: "22222222-2222-2222-2222-222222222222",
      brandId: "topdealsus", script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" },
      caption: "cap", createdAt: new Date(0).toISOString(), igMediaId: "m1", igPermalink: "https://instagr.am/p/x", lastPublishError: null,
    });
    expect(p.igMediaId).toBe("m1");
    expect(p.igPermalink).toBe("https://instagr.am/p/x");
  });
});
