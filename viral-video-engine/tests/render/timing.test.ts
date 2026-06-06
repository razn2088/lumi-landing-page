import { describe, it, expect } from "vitest";
import { msToFrames, totalDurationInFrames, activeWordIndex, isVideoUrl, FPS, END_CARD_TAIL_MS } from "../../src/render/timing.js";

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

  it("isVideoUrl detects common video extensions", () => {
    expect(isVideoUrl("https://x/a.mp4")).toBe(true);
    expect(isVideoUrl("https://x/a-hd_1080_1920_30fps.mp4")).toBe(true);
    expect(isVideoUrl("https://x/a.png")).toBe(false);
    expect(isVideoUrl("https://x/a.jpg")).toBe(false);
  });
});
