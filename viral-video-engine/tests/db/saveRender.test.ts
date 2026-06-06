import { describe, it, expect } from "vitest";
import { MemoryPostsRepo } from "../../src/db/memoryRepos.js";

describe("PostsRepo.saveRender", () => {
  it("sets videoUrl and status=rendered on the post", async () => {
    const posts = new MemoryPostsRepo();
    const post = await posts.upsertForArticle("11111111-1111-1111-1111-111111111111", "topdealsus", {
      script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" },
      caption: "cap", hashtags: [],
    });
    await posts.saveRender(post.id, "https://s/video/x.mp4");
    const after = await posts.getById(post.id);
    expect(after!.videoUrl).toBe("https://s/video/x.mp4");
    expect(after!.status).toBe("rendered");
  });

  it("throws for an unknown post", async () => {
    const posts = new MemoryPostsRepo();
    await expect(posts.saveRender("missing", "https://s/x.mp4")).rejects.toThrow();
  });
});
