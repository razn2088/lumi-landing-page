import { describe, it, expect } from "vitest";
import { buildSegments } from "../../src/pipeline/segments.js";
import type { Script, WordTiming } from "../../src/types/domain.js";

const script: Script = {
  hook: "Hook two",            // 2 words
  beats: [
    { kind: "broll", voiceover: "Beat one here", brollKeywords: [] },     // 3 words
    { kind: "product_image", voiceover: "Beat two", brollKeywords: [] },  // 2 words
  ],
  cta: "Go now",               // 2 words
};

// 9 words total -> startMs every 100ms
const timings: WordTiming[] = ["Hook","two","Beat","one","here","Beat","two","Go","now"]
  .map((word, i) => ({ word, startMs: i * 100 }));

describe("buildSegments", () => {
  it("merges the hook into the first beat as one shot, with distinct per-beat clips", () => {
    const segs = buildSegments(
      script,
      [{ clips: ["https://c/0.mp4"], clipKind: "video" }, { clips: ["https://c/1.mp4"], clipKind: "image" }],
      timings,
      1000,
    );
    expect(segs.map((s) => s.role)).toEqual(["hook", "beat", "cta"]);
    // hook+beat0: words 0..4 -> [0,500); beat1 5..6 -> [500,700); cta 7..8 -> [700,1000)
    expect(segs[0]).toMatchObject({ role: "hook", beatIndex: 0, startMs: 0, endMs: 500, clipUrl: "https://c/0.mp4", clipKind: "video" });
    expect(segs[1]).toMatchObject({ role: "beat", beatIndex: 1, startMs: 500, endMs: 700, clipUrl: "https://c/1.mp4", clipKind: "image" });
    expect(segs[2]).toMatchObject({ role: "cta", startMs: 700, endMs: 1000, clipUrl: null, clips: [] });
    // no clip url repeats across non-cta segments
    const urls = segs.filter((s) => s.role !== "cta").map((s) => s.clipUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses totalDurationMs as the final endMs and tolerates an empty pool", () => {
    const segs = buildSegments(
      script,
      [{ clips: ["https://c/0.mp4"], clipKind: "video" }, { clips: [], clipKind: "video" }],
      timings,
      1234,
    );
    expect(segs[segs.length - 1]!.endMs).toBe(1234);
    expect(segs[1]!.clipUrl).toBeNull(); // beat1 with no clip
    expect(segs[1]!.clips).toEqual([]);
  });
});
