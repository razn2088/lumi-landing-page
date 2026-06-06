import { describe, it, expect } from "vitest";
import { scanBrand } from "../../src/pipeline/scan.js";
import { MemoryArticlesRepo, MemoryJobsRepo } from "../../src/db/memoryRepos.js";
import { FakeWordPressClient } from "../../src/wordpress/fakeClient.js";
import posts from "../../test/fixtures/topdealsus-posts.json" with { type: "json" };
import type { Brand } from "../../src/types/domain.js";
import type { WpPost } from "../../src/wordpress/parse.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US",
  siteUrl: "https://topdealsus.com", wpApiBase: "https://topdealsus.com/wp-json/wp/v2",
  niche: "deals", tone: "punchy", useFeaturedImageBeat: true, active: true,
  handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
};

describe("scanBrand", () => {
  it("inserts new articles and enqueues one generate job each", async () => {
    const articles = new MemoryArticlesRepo();
    const jobs = new MemoryJobsRepo();
    const wp = new FakeWordPressClient(posts as WpPost[]);

    const result = await scanBrand(brand, { wp, articles, jobs });

    expect(result).toEqual({ scanned: 2, inserted: 2, enqueued: 2 });
    const claimed = await jobs.claim(["generate"], "w1");
    expect(claimed?.type).toBe("generate");
    expect(typeof claimed?.payload.articleId).toBe("string");
  });

  it("is idempotent — a second scan of the same posts inserts nothing", async () => {
    const articles = new MemoryArticlesRepo();
    const jobs = new MemoryJobsRepo();
    const wp = new FakeWordPressClient(posts as WpPost[]);

    await scanBrand(brand, { wp, articles, jobs });
    const second = await scanBrand(brand, { wp, articles, jobs });

    expect(second).toEqual({ scanned: 2, inserted: 0, enqueued: 0 });
  });
});
