import { describe, it, expect } from "vitest";
import { ArticleSchema, JobSchema, BrandSchema } from "../../src/types/domain.js";

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
        brandId: "topdealsus",
        wpPostId: 1,
        url: "https://topdealsus.com/x",
        title: "x",
        publishedAt: "2026-06-01T00:00:00.000Z",
      }),
    ).toThrow();
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
