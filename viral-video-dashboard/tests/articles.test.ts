import { describe, it, expect } from "vitest";
import { deriveArticleStatus, instagramBadge, summarize, rowToArticle, type ArticleRow } from "../lib/articles";

describe("deriveArticleStatus", () => {
  it("new when no post", () => expect(deriveArticleStatus(null)).toBe("new"));
  it("in_progress when post has no video", () => expect(deriveArticleStatus({ status: "pending_review", video_url: null })).toBe("in_progress"));
  it("published when post is published", () => expect(deriveArticleStatus({ status: "published", video_url: "v.mp4" })).toBe("published"));
  it("created when rendered with video", () => expect(deriveArticleStatus({ status: "rendered", video_url: "v.mp4" })).toBe("created"));
  it("created when approved with video", () => expect(deriveArticleStatus({ status: "approved", video_url: "v.mp4" })).toBe("created"));
});

describe("instagramBadge", () => {
  it("null when no video yet", () => expect(instagramBadge({ status: "pending_review", video_url: null })).toBeNull());
  it("null when no post", () => expect(instagramBadge(null)).toBeNull());
  it("published with href when published + permalink", () =>
    expect(instagramBadge({ status: "published", video_url: "v.mp4", ig_permalink: "https://insta/p/1" }))
      .toEqual({ platform: "instagram", state: "published", href: "https://insta/p/1" }));
  it("not_posted when rendered", () =>
    expect(instagramBadge({ status: "rendered", video_url: "v.mp4" }))
      .toEqual({ platform: "instagram", state: "not_posted", href: null }));
});

describe("summarize", () => {
  it("counts per status", () => {
    const rows = [
      { status: "new" }, { status: "new" }, { status: "in_progress" },
      { status: "created" }, { status: "published" },
    ] as ArticleRow[];
    expect(summarize(rows)).toEqual({ new: 2, in_progress: 1, created: 1, published: 1 });
  });
});

describe("rowToArticle", () => {
  it("maps a published article with permalink", () => {
    const r = rowToArticle({ id: "a1", title: "T", brand_id: "b1", published_at: "2026-01-01",
      posts: [{ video_url: "v.mp4", status: "published", ig_permalink: "https://insta/p/1" }] });
    expect(r.status).toBe("published");
    expect(r.instagram).toEqual({ platform: "instagram", state: "published", href: "https://insta/p/1" });
  });
});
