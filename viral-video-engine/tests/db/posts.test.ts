import { describe, it, expect } from "vitest";
import { MemoryArticlesRepo, MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import type { GeneratedContent } from "../../src/types/domain.js";

const content: GeneratedContent = {
  script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" },
  caption: "cap",
  hashtags: ["deals"],
};

describe("MemoryArticlesRepo.getById", () => {
  it("returns an inserted article by id, or null", async () => {
    const repo = new MemoryArticlesRepo();
    const saved = await repo.insert({
      brandId: "b", wpPostId: 1, url: "https://x.com/1", title: "t",
      excerpt: "", content: "", imageUrls: [], featuredImageUrl: null,
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    expect((await repo.getById(saved.id))?.title).toBe("t");
    expect(await repo.getById("missing")).toBeNull();
  });
});

describe("MemoryPostsRepo", () => {
  it("upserts a post for an article and reads it back", async () => {
    const repo = new MemoryPostsRepo();
    const a = await repo.upsertForArticle("art-1", "topdealsus", content);
    expect(a.id).toBeTruthy();
    expect(a.status).toBe("pending_review");
    expect(a.caption).toBe("cap");
    expect((await repo.getByArticleId("art-1"))?.id).toBe(a.id);
  });

  it("upsert replaces the existing post for the same article (same id)", async () => {
    const repo = new MemoryPostsRepo();
    const first = await repo.upsertForArticle("art-1", "topdealsus", content);
    const second = await repo.upsertForArticle("art-1", "topdealsus", { ...content, caption: "new" });
    expect(second.id).toBe(first.id);
    expect((await repo.getByArticleId("art-1"))?.caption).toBe("new");
  });
});
