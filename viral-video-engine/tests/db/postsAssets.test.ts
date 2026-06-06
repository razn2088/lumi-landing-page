import { describe, it, expect } from "vitest";
import { MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import type { GeneratedContent, PostAssets } from "../../src/types/domain.js";

const content: GeneratedContent = {
  script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" },
  caption: "cap", hashtags: [],
};
const assets: PostAssets = { voiceoverUrl: "https://x/a.wav", voiceoverDurationMs: 5000, clipUrls: ["https://x/1.mp4"] };

describe("MemoryPostsRepo getById + saveAssets", () => {
  it("gets a post by id and saves assets onto it", async () => {
    const repo = new MemoryPostsRepo();
    const post = await repo.upsertForArticle("art-1", "topdealsus", content);
    expect((await repo.getById(post.id))?.articleId).toBe("art-1");
    await repo.saveAssets(post.id, assets);
    expect((await repo.getById(post.id))?.assets?.voiceoverUrl).toBe("https://x/a.wav");
  });
  it("getById returns null for a missing id", async () => {
    const repo = new MemoryPostsRepo();
    expect(await repo.getById("missing")).toBeNull();
  });
});
