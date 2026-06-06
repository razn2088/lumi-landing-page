import { describe, it, expect } from "vitest";
import { PostAssetsSchema } from "../../src/types/domain.js";

describe("PostAssetsSchema", () => {
  it("parses assets with a voiceover and clips", () => {
    const a = PostAssetsSchema.parse({
      voiceoverUrl: "https://x/audio.wav",
      voiceoverDurationMs: 18000,
      clipUrls: ["https://x/1.mp4", "https://x/2.mp4"],
    });
    expect(a.clipUrls).toHaveLength(2);
  });
  it("defaults clipUrls to []", () => {
    const a = PostAssetsSchema.parse({ voiceoverUrl: "https://x/a.wav", voiceoverDurationMs: 1000 });
    expect(a.clipUrls).toEqual([]);
  });
  it("rejects a non-positive duration", () => {
    expect(() => PostAssetsSchema.parse({ voiceoverUrl: "https://x/a.wav", voiceoverDurationMs: 0 })).toThrow();
  });
});
