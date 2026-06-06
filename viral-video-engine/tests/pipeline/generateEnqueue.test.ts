import { describe, it, expect } from "vitest";
import { generateForArticle } from "../../src/pipeline/generate.js";
import { MemoryBrandsRepo, MemoryArticlesRepo, MemoryPostsRepo, MemoryJobsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeLLMProvider } from "../../src/providers/llm/fake.js";
import type { Brand } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "deals", tone: "punchy",
  useFeaturedImageBeat: false, active: true,
};
const llmJson = JSON.stringify({ script: { hook: "h", beats: [{ voiceover: "v" }], cta: "c" }, caption: "cap", hashtags: [] });

describe("generateForArticle enqueues an assets job", () => {
  it("enqueues assets for the new post", async () => {
    const brands = new MemoryBrandsRepo([brand]);
    const articles = new MemoryArticlesRepo();
    const posts = new MemoryPostsRepo();
    const jobs = new MemoryJobsRepo();
    const reg = new ProviderRegistry();
    reg.register("llm", "fake", new FakeLLMProvider(llmJson, "fake"));
    const router = new ProviderRouter(reg);
    const art = await articles.insert({
      brandId: "topdealsus", wpPostId: 1, url: "https://x/1", title: "t",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    const post = await generateForArticle(art.id, { brands, articles, posts, jobs, router, llmChain: ["fake"] });
    const claimed = await jobs.claim(["assets"], "w1");
    expect(claimed?.type).toBe("assets");
    expect(claimed?.payload.postId).toBe(post.id);
  });
});
