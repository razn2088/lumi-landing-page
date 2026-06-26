import { describe, it, expect } from "vitest";
import { msToFrames, totalDurationInFrames, activeWordIndex, captionChunks, chunkRangeFor, isVideoUrl, FPS, END_CARD_TAIL_MS } from "../../src/render/timing.js";

describe("timing helpers", () => {
  it("msToFrames rounds ms to frames at FPS", () => {
    expect(msToFrames(1000)).toBe(FPS);
    expect(msToFrames(33)).toBe(1); // ~1 frame at 30fps
  });

  it("totalDurationInFrames adds the end-card tail", () => {
    expect(totalDurationInFrames(1000)).toBe(msToFrames(1000 + END_CARD_TAIL_MS));
    expect(totalDurationInFrames(0)).toBeGreaterThanOrEqual(1);
  });

  it("activeWordIndex returns the last word whose startMs <= time", () => {
    const w = [{ word: "a", startMs: 0 }, { word: "b", startMs: 500 }, { word: "c", startMs: 1000 }];
    expect(activeWordIndex(w, -1)).toBe(-1);
    expect(activeWordIndex(w, 0)).toBe(0);
    expect(activeWordIndex(w, 600)).toBe(1);
    expect(activeWordIndex(w, 5000)).toBe(2);
  });

  it("captionChunks splits at sentence ends, commas, and the word cap", () => {
    const w = [
      { word: "Stop", startMs: 0 }, { word: "scrolling,", startMs: 200 }, { word: "seriously.", startMs: 400 },
      { word: "These", startMs: 600 }, { word: "are", startMs: 700 }, { word: "the", startMs: 800 },
      { word: "five", startMs: 900 }, { word: "best", startMs: 1000 }, { word: "deals", startMs: 1100 },
    ];
    // "Stop scrolling," (comma, len 2 < 3 so no split) -> actually splits only at "seriously." then 5-word cap
    expect(captionChunks(w, 5)).toEqual([[0, 2], [3, 7], [8, 8]]);
  });

  it("captionChunks keeps a number with its unit even at the word cap", () => {
    const w = [
      { word: "These", startMs: 0 }, { word: "are", startMs: 1 }, { word: "thick", startMs: 2 },
      { word: "and", startMs: 3 }, { word: "7", startMs: 4 }, { word: "inches", startMs: 5 }, { word: "tall.", startMs: 6 },
    ];
    // without the guard the cap (5) would split after "7"; the guard keeps "7 inches" together
    const ranges = captionChunks(w, 5);
    const splitsAfter7 = ranges.some(([, e]) => w[e]!.word === "7");
    expect(splitsAfter7).toBe(false);
  });

  it("chunkRangeFor returns the phrase containing the active word", () => {
    const w = [
      { word: "Stop", startMs: 0 }, { word: "scrolling.", startMs: 300 },
      { word: "These", startMs: 600 }, { word: "are", startMs: 800 }, { word: "really", startMs: 900 }, { word: "great", startMs: 1000 }, { word: "deals.", startMs: 1100 },
    ];
    expect(chunkRangeFor(w, 0, 5)).toEqual([0, 1]); // "Stop scrolling."
    expect(chunkRangeFor(w, 4, 5)).toEqual([2, 6]); // "These are really great deals."
  });

  it("isVideoUrl detects common video extensions", () => {
    expect(isVideoUrl("https://x/a.mp4")).toBe(true);
    expect(isVideoUrl("https://x/a-hd_1080_1920_30fps.mp4")).toBe(true);
    expect(isVideoUrl("https://x/a.png")).toBe(false);
    expect(isVideoUrl("https://x/a.jpg")).toBe(false);
  });
});
