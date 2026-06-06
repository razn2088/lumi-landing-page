import { describe, it, expect } from "vitest";
import posts from "../../test/fixtures/topdealsus-posts.json" with { type: "json" };
import { parseArticle, stripHtml, extractImageUrls } from "../../src/wordpress/parse.js";
import type { Brand } from "../../src/types/domain.js";
import type { WpPost } from "../../src/wordpress/parse.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US",
  siteUrl: "https://topdealsus.com", wpApiBase: "https://topdealsus.com/wp-json/wp/v2",
  niche: "deals", tone: "punchy", useFeaturedImageBeat: true, active: true,
  handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
};

describe("wordpress parse", () => {
  it("strips html and collapses whitespace", () => {
    expect(stripHtml("<p>Hello   <b>world</b></p>")).toBe("Hello world");
  });

  it("extracts image src urls", () => {
    expect(extractImageUrls('<img src="https://x/a.jpg"/><img src="https://x/b.png">')).toEqual([
      "https://x/a.jpg",
      "https://x/b.png",
    ]);
  });

  it("parses a WP post into an Article", () => {
    const a = parseArticle(brand, (posts as WpPost[])[0]!);
    expect(a.brandId).toBe("topdealsus");
    expect(a.wpPostId).toBe(2403);
    expect(a.title).toBe("Pure Climate Control: 5 Best High-Capacity Home Dehumidifiers on Amazon");
    expect(a.content).toContain("HOmeLabs 4500");
    expect(a.featuredImageUrl).toBe("https://topdealsus.com/wp-content/uploads/featured-dehum.jpg");
    expect(a.imageUrls).toContain("https://topdealsus.com/wp-content/uploads/dehum.jpg");
    expect(a.publishedAt).toBe("2026-06-01T12:40:28.000Z");
    expect(a.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces a stable hash for identical content and a different hash otherwise", () => {
    const a = parseArticle(brand, (posts as WpPost[])[0]!);
    const b = parseArticle(brand, (posts as WpPost[])[0]!);
    const c = parseArticle(brand, (posts as WpPost[])[1]!);
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.contentHash).not.toBe(c.contentHash);
  });
});
