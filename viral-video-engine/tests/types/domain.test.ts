import { describe, it, expect } from "vitest";
import { ArticleSchema, JobSchema, BrandSchema, SegmentSchema } from "../../src/types/domain.js";

describe("domain schemas", () => {
  it("parses a valid brand", () => {
    const brand = BrandSchema.parse({
      id: "topdealsus",
      name: "Top Deals US",
      siteUrl: "https://topdealsus.com",
      wpApiBase: "https://topdealsus.com/wp-json/wp/v2",
      niche: "deals",
      tone: "punchy",
    });
    expect(brand.useFeaturedImageBeat).toBe(false); // default applied
    expect(brand.active).toBe(true);
  });

  it("rejects an article missing a content hash", () => {
    expect(() =>
      ArticleSchema.parse({
        id: "11111111-1111-1111-1111-111111111111",
        brandId: "topdealsus",
        wpPostId: 1,
        url: "https://topdealsus.com/x",
        title: "x",
        publishedAt: "2026-06-01T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("applies article defaults", () => {
    const a = ArticleSchema.parse({
      id: "11111111-1111-1111-1111-111111111111",
      brandId: "topdealsus",
      wpPostId: 1,
      url: "https://topdealsus.com/x",
      title: "x",
      contentHash: "h1",
      publishedAt: "2026-06-01T00:00:00.000Z",
    });
    expect(a.excerpt).toBe("");
    expect(a.content).toBe("");
    expect(a.imageUrls).toEqual([]);
    expect(a.featuredImageUrl).toBeNull();
  });

  it("rejects a brand with an invalid siteUrl", () => {
    expect(() =>
      BrandSchema.parse({
        id: "x",
        name: "X",
        siteUrl: "not-a-url",
        wpApiBase: "https://x.com/wp-json/wp/v2",
        niche: "n",
        tone: "t",
      }),
    ).toThrow();
  });

  it("applies segment clip-pool defaults", () => {
    const seg = SegmentSchema.parse({ role: "beat", text: "t", startMs: 0, endMs: 100 });
    expect(seg.clipUrl).toBeNull();
    expect(seg.clipKind).toBe("video");
    expect(seg.clips).toEqual([]);
  });

  it("defaults job attempts and status", () => {
    const job = JobSchema.parse({
      id: "11111111-1111-1111-1111-111111111111",
      type: "generate",
      idempotencyKey: "generate:abc",
      runAfter: "2026-06-01T00:00:00.000Z",
    });
    expect(job.attempts).toBe(0);
    expect(job.status).toBe("queued");
    expect(job.maxAttempts).toBe(5);
  });
});
