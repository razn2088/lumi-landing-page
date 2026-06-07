import { describe, it, expect } from "vitest";
import { rowToPost, setPostStatus } from "../lib/posts.js";

describe("rowToPost", () => {
  it("maps a joined post row (brands embedded as object)", () => {
    const post = rowToPost({
      id: "p1", brand_id: "topdealsus",
      script: { hook: "h", beats: [{ kind: "broll", voiceover: "b" }], cta: "c" },
      caption: "cap", hashtags: ["#a"], video_url: "https://v/x.mp4", status: "rendered",
      created_at: "2026-06-07T00:00:00.000Z",
      brands: { name: "Top Deals US", handle: "@topdealsus" },
    });
    expect(post).toMatchObject({
      id: "p1", brandId: "topdealsus", brandName: "Top Deals US", brandHandle: "@topdealsus",
      caption: "cap", videoUrl: "https://v/x.mp4", status: "rendered",
    });
    expect(post.script.hook).toBe("h");
    expect(post.hashtags).toEqual(["#a"]);
  });

  it("tolerates brands embedded as a single-element array and missing handle", () => {
    const post = rowToPost({
      id: "p2", brand_id: "b", script: { hook: "h", beats: [], cta: "c" }, caption: "", hashtags: null,
      video_url: null, status: "approved", created_at: "2026-06-07T00:00:00.000Z",
      brands: [{ name: "B", handle: null }],
    });
    expect(post.brandName).toBe("B");
    expect(post.brandHandle).toBe("");
    expect(post.hashtags).toEqual([]);
    expect(post.videoUrl).toBeNull();
  });
});

describe("setPostStatus", () => {
  it("updates the post status by id", async () => {
    const calls: any[] = [];
    const fakeSb: any = {
      from: () => ({
        update: (patch: any) => { calls.push(["update", patch]); return { eq: (col: string, val: string) => { calls.push(["eq", col, val]); return Promise.resolve({ error: null }); } }; },
      }),
    };
    await setPostStatus(fakeSb, "p1", "approved");
    expect(calls).toContainEqual(["update", { status: "approved" }]);
    expect(calls).toContainEqual(["eq", "id", "p1"]);
  });

  it("throws on a supabase error", async () => {
    const fakeSb: any = { from: () => ({ update: () => ({ eq: () => Promise.resolve({ error: { message: "boom" } }) }) }) };
    await expect(setPostStatus(fakeSb, "p1", "rejected")).rejects.toThrow("boom");
  });
});
