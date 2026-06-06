import { describe, it, expect } from "vitest";
import { generateForArticle } from "../../src/pipeline/generate.js";
import { MemoryBrandsRepo, MemoryArticlesRepo, MemoryPostsRepo, MemoryJobsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeLLMProvider } from "../../src/providers/llm/fake.js";
import type { Brand } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "Amazon deals",
  tone: "punchy", useFeaturedImageBeat: true, active: true,
  handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
};

const llmJson = JSON.stringify({
  script: { hook: "Stop overpaying", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["dehumidifier"] }], cta: "Link in bio" },
  caption: "best dehumidifiers right now",
  hashtags: ["deals", "amazon"],
});

function deps(llmText: string) {
  const brands = new MemoryBrandsRepo([brand]);
  const articles = new MemoryArticlesRepo();
  const posts = new MemoryPostsRepo();
  const jobs = new MemoryJobsRepo();
  const reg = new ProviderRegistry();
  reg.register("llm", "fake", new FakeLLMProvider(llmText, "fake"));
  const router = new ProviderRouter(reg);
  return { brands, articles, posts, jobs, router, llmChain: ["fake"] };
}

describe("generateForArticle", () => {
  it("generates and stores a post for an article", async () => {
    const d = deps(llmJson);
    const art = await d.articles.insert({
      brandId: "topdealsus", wpPostId: 1, url: "https://topdealsus.com/x", title: "5 Best Dehumidifiers",
      excerpt: "", content: "body", imageUrls: [], featuredImageUrl: "https://x/f.jpg",
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    const post = await generateForArticle(art.id, d);
    expect(post.script.hook).toBe("Stop overpaying");
    expect(post.caption).toBe("best dehumidifiers right now");
    expect(post.status).toBe("pending_review");
    expect((await d.posts.getByArticleId(art.id))?.id).toBe(post.id);
  });

  it("throws when the article is missing", async () => {
    const d = deps(llmJson);
    await expect(generateForArticle("missing", d)).rejects.toThrow(/article not found/i);
  });

  it("throws when the brand is missing", async () => {
    const d = deps(llmJson);
    const art = await d.articles.insert({
      brandId: "ghost", wpPostId: 1, url: "https://x/1", title: "t",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
      contentHash: "h2", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    await expect(generateForArticle(art.id, d)).rejects.toThrow(/brand not found/i);
  });
});
