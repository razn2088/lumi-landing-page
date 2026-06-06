import { describe, it, expect } from "vitest";
import { WordTimingSchema, SegmentSchema, PostAssetsSchema, BrandSchema } from "../../src/types/domain.js";

describe("render schemas", () => {
  it("parses a word timing", () => {
    expect(WordTimingSchema.parse({ word: "hello", startMs: 120 })).toEqual({ word: "hello", startMs: 120 });
  });

  it("parses a segment with defaults", () => {
    const s = SegmentSchema.parse({ role: "beat", beatIndex: 0, text: "hi", startMs: 0, endMs: 500 });
    expect(s.clipUrl).toBeNull();
  });

  it("PostAssets defaults wordTimings and segments to empty arrays", () => {
    const a = PostAssetsSchema.parse({ voiceoverUrl: "https://x/a.wav", voiceoverDurationMs: 1000 });
    expect(a.wordTimings).toEqual([]);
    expect(a.segments).toEqual([]);
    expect(a.clipUrls).toEqual([]);
  });

  it("Brand provides render defaults", () => {
    const b = BrandSchema.parse({ id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com", wpApiBase: "https://topdealsus.com/wp-json/wp/v2" });
    expect(b.handle).toBe("");
    expect(b.logoUrl).toBeNull();
    expect(b.brandColor).toBe("#ffd60a");
    expect(b.musicDriveFolderId).toBeNull();
  });
});
