import { describe, it, expect } from "vitest";
import { drain } from "../../src/worker/runtime.js";
import { MemoryJobsRepo, MemoryBrandsRepo, MemoryArticlesRepo, MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeLLMProvider } from "../../src/providers/llm/fake.js";
import { buildHandlers } from "../../src/worker/handlers.js";
import type { Brand } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "deals", tone: "punchy",
  useFeaturedImageBeat: false, active: true,
};
const llmJson = JSON.stringify({ script: { hook: "h", beats: [{ voiceover: "v" }], cta: "c" }, caption: "cap", hashtags: [] });

describe("drain", () => {
  it("processes all queued generate jobs until idle, then is empty", async () => {
    const brands = new MemoryBrandsRepo([brand]);
    const articles = new MemoryArticlesRepo();
    const posts = new MemoryPostsRepo();
    const jobs = new MemoryJobsRepo();
    const reg = new ProviderRegistry();
    reg.register("llm", "fake", new FakeLLMProvider(llmJson, "fake"));
    const router = new ProviderRouter(reg);

    const articleIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const art = await articles.insert({
        brandId: "topdealsus", wpPostId: i, url: `https://x/${i}`, title: `t${i}`,
        excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
        contentHash: `h${i}`, publishedAt: "2026-06-01T00:00:00.000Z",
      });
      articleIds.push(art.id);
      await jobs.enqueue({ type: "generate", idempotencyKey: `generate:${art.id}`, payload: { articleId: art.id, brandId: "topdealsus" } });
    }

    const handlers = buildHandlers({ brands, articles, posts, router, llmChain: ["fake"] });

    const processed = await drain({ jobs, workerId: "w1", handlers });
    expect(processed).toBe(3);
    for (const id of articleIds) {
      expect((await posts.getByArticleId(id))?.caption).toBe("cap");
    }

    const again = await drain({ jobs, workerId: "w1", handlers });
    expect(again).toBe(0);
  });
});
