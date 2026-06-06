import { describe, it, expect } from "vitest";
import { buildHandlers } from "../../src/worker/handlers.js";
import { MemoryBrandsRepo, MemoryArticlesRepo, MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeLLMProvider } from "../../src/providers/llm/fake.js";
import type { Brand } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "deals", tone: "punchy",
  useFeaturedImageBeat: false, active: true,
};
const llmJson = JSON.stringify({
  script: { hook: "h", beats: [{ voiceover: "v" }], cta: "c" }, caption: "cap", hashtags: [],
});

describe("buildHandlers", () => {
  it("registers a 'generate' handler that produces a post", async () => {
    const brands = new MemoryBrandsRepo([brand]);
    const articles = new MemoryArticlesRepo();
    const posts = new MemoryPostsRepo();
    const reg = new ProviderRegistry();
    reg.register("llm", "fake", new FakeLLMProvider(llmJson, "fake"));
    const router = new ProviderRouter(reg);

    const art = await articles.insert({
      brandId: "topdealsus", wpPostId: 1, url: "https://x/1", title: "t",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });

    const handlers = buildHandlers({ brands, articles, posts, router, llmChain: ["fake"] });
    expect(typeof handlers.generate).toBe("function");
    await handlers.generate!({ articleId: art.id, brandId: "topdealsus" });
    expect((await posts.getByArticleId(art.id))?.caption).toBe("cap");
  });
});
