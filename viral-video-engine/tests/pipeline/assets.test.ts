import { describe, it, expect } from "vitest";
import { buildAssetsForPost } from "../../src/pipeline/assets.js";
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
  useFeaturedImageBeat: true, active: true,
  handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
};
const content: GeneratedContent = {
  script: {
    hook: "Stop overpaying",
    beats: [
      { kind: "broll", voiceover: "fans just move damp air", brollKeywords: ["humid room"] },
      { kind: "product_image", voiceover: "this dehumidifier fixes it", brollKeywords: ["dehumidifier"] },
    ],
    cta: "Link in bio",
  },
  caption: "best dehumidifiers", hashtags: ["deals"],
};

async function setup() {
  const brands = new MemoryBrandsRepo([brand]);
  const articles = new MemoryArticlesRepo();
  const posts = new MemoryPostsRepo();
  const jobs = new MemoryJobsRepo();
  const storage = new MemoryStorage("https://cdn.test");
  const reg = new ProviderRegistry();
  reg.register("tts", "fake", new FakeTTSProvider());
  reg.register("stock", "fake", new FakeStockProvider({ "humid room": "https://stock/humid.mp4" }));
  const router = new ProviderRouter(reg);
  const art = await articles.insert({
    brandId: "topdealsus", wpPostId: 1, url: "https://topdealsus.com/x", title: "5 Best Dehumidifiers",
    excerpt: "", content: "body", imageUrls: [], featuredImageUrl: "https://topdealsus.com/feat.jpg",
    contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
  });
  const post = await posts.upsertForArticle(art.id, "topdealsus", content);
  return { brands, articles, posts, jobs, storage, router, post };
}

describe("buildAssetsForPost", () => {
  it("produces a voiceover + one clip per beat and enqueues a render job", async () => {
    const d = await setup();
    const assets = await buildAssetsForPost(d.post.id, {
      brands: d.brands, articles: d.articles, posts: d.posts, jobs: d.jobs,
      storage: d.storage, router: d.router, ttsChain: ["fake"], stockChain: ["fake"],
    });
    expect(assets.voiceoverUrl).toMatch(/^https:\/\/cdn\.test\//);
    expect(assets.voiceoverDurationMs).toBeGreaterThan(0);
    expect(assets.clipUrls).toContain("https://topdealsus.com/feat.jpg");
    expect(assets.clipUrls).toContain("https://stock/humid.mp4");
    expect((await d.posts.getById(d.post.id))?.assets?.voiceoverUrl).toBe(assets.voiceoverUrl);
    const claimed = await d.jobs.claim(["render"], "w1");
    expect(claimed?.type).toBe("render");
    expect(claimed?.payload.postId).toBe(d.post.id);
  });

  it("falls back to the featured image when a broll beat has no stock match", async () => {
    const d = await setup();
    const art2 = await d.articles.insert({
      brandId: "topdealsus", wpPostId: 2, url: "https://topdealsus.com/y", title: "t2",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: "https://topdealsus.com/feat2.jpg",
      contentHash: "h2", publishedAt: "2026-06-02T00:00:00.000Z",
    });
    const post2 = await d.posts.upsertForArticle(art2.id, "topdealsus", {
      script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["no-match"] }], cta: "c" },
      caption: "c", hashtags: [],
    });
    const assets = await buildAssetsForPost(post2.id, {
      brands: d.brands, articles: d.articles, posts: d.posts, jobs: d.jobs,
      storage: d.storage, router: d.router, ttsChain: ["fake"], stockChain: ["fake"],
    });
    expect(assets.clipUrls).toEqual(["https://topdealsus.com/feat2.jpg"]);
  });

  it("throws when the post is missing", async () => {
    const d = await setup();
    await expect(buildAssetsForPost("missing", {
      brands: d.brands, articles: d.articles, posts: d.posts, jobs: d.jobs,
      storage: d.storage, router: d.router, ttsChain: ["fake"], stockChain: ["fake"],
    })).rejects.toThrow(/post not found/i);
  });

  it("stores wordTimings and a segments timeline aligned to the script", async () => {
    const d = await setup();
    const assets = await buildAssetsForPost(d.post.id, {
      brands: d.brands, articles: d.articles, posts: d.posts, jobs: d.jobs,
      storage: d.storage, router: d.router, ttsChain: ["fake"], stockChain: ["fake"],
    });
    expect(assets.wordTimings.length).toBeGreaterThan(0);
    expect(assets.segments[0]!.role).toBe("hook");
    expect(assets.segments[assets.segments.length - 1]!.role).toBe("cta");
    expect(assets.segments.some((s) => s.role === "beat")).toBe(true);
    expect(assets.segments[assets.segments.length - 1]!.clipUrl).toBeNull();
  });
});
