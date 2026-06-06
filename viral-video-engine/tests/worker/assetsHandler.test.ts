import { describe, it, expect } from "vitest";
import { buildAssetsHandlers } from "../../src/worker/handlers.js";
import { MemoryBrandsRepo, MemoryArticlesRepo, MemoryPostsRepo, MemoryJobsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeTTSProvider } from "../../src/providers/tts/fake.js";
import { FakeStockProvider } from "../../src/providers/stock/fake.js";
import { MemoryStorage } from "../../src/storage/memory.js";
import type { Brand, GeneratedContent } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "deals", tone: "punchy",
  useFeaturedImageBeat: false, active: true,
};
const content: GeneratedContent = { script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" }, caption: "c", hashtags: [] };

describe("buildAssetsHandlers", () => {
  it("registers an 'assets' handler that produces assets for a post", async () => {
    const brands = new MemoryBrandsRepo([brand]);
    const articles = new MemoryArticlesRepo();
    const posts = new MemoryPostsRepo();
    const jobs = new MemoryJobsRepo();
    const storage = new MemoryStorage("https://cdn.test");
    const reg = new ProviderRegistry();
    reg.register("tts", "fake", new FakeTTSProvider());
    reg.register("stock", "fake", new FakeStockProvider({ k: "https://stock/k.mp4" }));
    const router = new ProviderRouter(reg);
    const art = await articles.insert({
      brandId: "topdealsus", wpPostId: 1, url: "https://x/1", title: "t",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: "https://x/f.jpg",
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    const post = await posts.upsertForArticle(art.id, "topdealsus", content);
    const handlers = buildAssetsHandlers({ brands, articles, posts, jobs, storage, router, ttsChain: ["fake"], stockChain: ["fake"] });
    expect(typeof handlers.assets).toBe("function");
    await handlers.assets!({ postId: post.id, brandId: "topdealsus" });
    expect((await posts.getById(post.id))?.assets?.clipUrls).toContain("https://stock/k.mp4");
  });
});
