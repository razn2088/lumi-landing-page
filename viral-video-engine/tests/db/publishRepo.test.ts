import { describe, it, expect } from "vitest";
import { MemoryPostsRepo } from "../../src/db/memoryRepos.js";

const content = { script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" }, caption: "cap", hashtags: ["#a"] };

describe("PostsRepo publish methods (memory)", () => {
  it("listByStatus filters by status", async () => {
    const posts = new MemoryPostsRepo();
    const p = await posts.upsertForArticle("11111111-1111-1111-1111-111111111111", "topdealsus", content as any);
    await posts.saveRender(p.id, "https://v/x.mp4"); // -> status 'rendered'
    expect((await posts.listByStatus("rendered")).map((x) => x.id)).toEqual([p.id]);
    expect(await posts.listByStatus("approved")).toEqual([]);
  });

  it("markPublished sets status + ig fields; markPublishFailed records the error", async () => {
    const posts = new MemoryPostsRepo();
    const p = await posts.upsertForArticle("22222222-2222-2222-2222-222222222222", "topdealsus", content as any);
    await posts.markPublished(p.id, "M1", "https://instagram.com/reel/x");
    let after = await posts.getById(p.id);
    expect(after!.status).toBe("published");
    expect(after!.igMediaId).toBe("M1");
    expect(after!.igPermalink).toBe("https://instagram.com/reel/x");

    const q = await posts.upsertForArticle("33333333-3333-3333-3333-333333333333", "topdealsus", content as any);
    await posts.markPublishFailed(q.id, "bad token");
    after = await posts.getById(q.id);
    expect(after!.status).toBe("publish_failed");
    expect(after!.lastPublishError).toBe("bad token");
  });
});
