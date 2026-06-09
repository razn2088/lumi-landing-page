import { describe, it, expect } from "vitest";
import { deriveArticleStatus, rowToArticle } from "../lib/articles";

describe("deriveArticleStatus", () => {
  it("New when no post, In progress when post has no video, Created when video exists", () => {
    expect(deriveArticleStatus(null)).toBe("new");
    expect(deriveArticleStatus({ video_url: null, status: "pending_review" })).toBe("in_progress");
    expect(deriveArticleStatus({ video_url: "https://v/x.mp4", status: "rendered" })).toBe("created");
  });
});

describe("rowToArticle", () => {
  it("maps a joined article row (posts embedded as array)", () => {
    const a = rowToArticle({ id: "a1", title: "T", brand_id: "topdealsus", published_at: "2026-06-01T00:00:00Z", posts: [{ video_url: "https://v/x.mp4", status: "approved" }] });
    expect(a).toMatchObject({ id: "a1", title: "T", brandId: "topdealsus", status: "created", postStatus: "approved" });
  });
});
