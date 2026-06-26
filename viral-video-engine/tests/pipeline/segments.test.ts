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
  it("maps roles, boundaries, and per-beat clips", () => {
    const segs = buildSegments(
      script,
      [{ clips: ["https://c/0.mp4"], clipKind: "video" }, { clips: ["https://c/1.mp4"], clipKind: "image" }],
      timings,
      1000,
    );
    expect(segs.map((s) => s.role)).toEqual(["hook", "beat", "beat", "cta"]);
    // hook: words 0..1 -> [0,200); first beat 2..4 -> [200,500); second beat 5..6 -> [500,700); cta 7..8 -> [700,1000)
    expect(segs[0]).toMatchObject({ startMs: 0, endMs: 200, clipUrl: "https://c/0.mp4", clips: ["https://c/0.mp4"] }); // hook reuses first beat clip
    expect(segs[1]).toMatchObject({ role: "beat", beatIndex: 0, startMs: 200, endMs: 500, clipUrl: "https://c/0.mp4", clipKind: "video" });
    expect(segs[2]).toMatchObject({ role: "beat", beatIndex: 1, startMs: 500, endMs: 700, clipUrl: "https://c/1.mp4", clipKind: "image" });
    expect(segs[3]).toMatchObject({ role: "cta", startMs: 700, endMs: 1000, clipUrl: null, clips: [] });
  });

  it("uses totalDurationMs as the final endMs and tolerates an empty pool", () => {
    const segs = buildSegments(
      script,
      [{ clips: ["https://c/0.mp4"], clipKind: "video" }, { clips: [], clipKind: "video" }],
      timings,
      1234,
    );
    expect(segs[segs.length - 1]!.endMs).toBe(1234);
    expect(segs[2]!.clipUrl).toBeNull(); // beat with no clip
    expect(segs[2]!.clips).toEqual([]);
  });
});
