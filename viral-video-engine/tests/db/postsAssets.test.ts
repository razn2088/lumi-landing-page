import { describe, it, expect } from "vitest";
import { MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import { rowToPost } from "../../src/db/supabaseRepos.js";
import type { GeneratedContent, PostAssets } from "../../src/types/domain.js";

const content: GeneratedContent = {
  script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" },
  caption: "cap", hashtags: [],
};
const assets: PostAssets = { voiceoverUrl: "https://x/a.wav", voiceoverDurationMs: 5000, clipUrls: ["https://x/1.mp4"], wordTimings: [], segments: [] };

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

describe("rowToPost mapper", () => {
  it("maps word_timings, segments, and video_url onto post.assets", () => {
    const row = {
      id: "11111111-1111-1111-1111-111111111111",
      article_id: "22222222-2222-2222-2222-222222222222",
      brand_id: "topdealsus",
      script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" },
      caption: "cap", hashtags: [], status: "pending_review", created_at: new Date(0).toISOString(),
      voiceover_url: "https://x/a.wav", voiceover_duration_ms: 1000, clip_urls: ["https://c/0.mp4"],
      word_timings: [{ word: "h", startMs: 0 }],
      segments: [{ role: "hook", text: "h", startMs: 0, endMs: 1000, clipUrl: null }],
      video_url: null,
    };
    const post = rowToPost(row);
    expect(post.assets?.wordTimings).toEqual([{ word: "h", startMs: 0 }]);
    expect(post.assets?.segments[0]!.role).toBe("hook");
    expect(post.videoUrl).toBeNull();
  });
});
