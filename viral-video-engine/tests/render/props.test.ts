import { describe, it, expect } from "vitest";
import { buildRenderProps } from "../../src/render/props.js";
import { PostSchema, BrandSchema, type Post, type Brand } from "../../src/types/domain.js";

const brand: Brand = BrandSchema.parse({
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", brandColor: "#ffd60a",
});

function post(assets?: unknown): Post {
  return PostSchema.parse({
    id: "11111111-1111-1111-1111-111111111111", articleId: "22222222-2222-2222-2222-222222222222",
    brandId: "topdealsus", script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" },
    caption: "cap", hashtags: [], createdAt: new Date(0).toISOString(),
    assets: assets ?? { voiceoverUrl: "https://s/a.wav", voiceoverDurationMs: 5000, wordTimings: [{ word: "h", startMs: 0 }], segments: [{ role: "hook", text: "h", startMs: 0, endMs: 5000, clipUrl: null }] },
  });
}

describe("buildRenderProps", () => {
  it("maps post + brand + music into render props, defaulting handle from id", () => {
    const props = buildRenderProps(post(), brand, "https://s/music/x.mp3");
    expect(props).toMatchObject({
      brandName: "Top Deals US", handle: "@topdealsus", brandColor: "#ffd60a",
      siteUrl: "https://topdealsus.com", voiceoverUrl: "https://s/a.wav", durationMs: 5000,
      musicUrl: "https://s/music/x.mp3",
    });
    expect(props.segments).toHaveLength(1);
    expect(props.wordTimings).toHaveLength(1);
  });

  it("uses an explicit brand handle when present and allows null music", () => {
    const props = buildRenderProps(post(), BrandSchema.parse({ ...brand, handle: "@deals" }), null);
    expect(props.handle).toBe("@deals");
    expect(props.musicUrl).toBeNull();
  });

  it("throws if the post has no assets", () => {
    const p = post();
    delete (p as { assets?: unknown }).assets;
    expect(() => buildRenderProps(p, brand, null)).toThrow();
  });
});
