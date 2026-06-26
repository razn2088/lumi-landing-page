import { describe, it, expect, vi, afterEach } from "vitest";
import { ElevenLabsTTSProvider, alignmentToWordTimings } from "../../src/providers/tts/elevenlabs.js";

afterEach(() => vi.restoreAllMocks());

describe("alignmentToWordTimings", () => {
  it("groups characters into words, startMs = first char start", () => {
    const al = {
      characters: ["H", "i", " ", "b", "o", "b"],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
    };
    expect(alignmentToWordTimings(al)).toEqual([
      { word: "Hi", startMs: 0 },
      { word: "bob", startMs: 300 },
    ]);
  });
  it("handles trailing word with no trailing space", () => {
    const al = { characters: ["g", "o"], character_start_times_seconds: [1, 1.1], character_end_times_seconds: [1.1, 1.2] };
    expect(alignmentToWordTimings(al)).toEqual([{ word: "go", startMs: 1000 }]);
  });
});

describe("ElevenLabsTTSProvider.synthesize", () => {
  it("returns mp3 audio, durationMs from last char end, and word timings", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      audio_base64: Buffer.from("AUDIO").toString("base64"),
      alignment: { characters: ["H", "i"], character_start_times_seconds: [0, 0.1], character_end_times_seconds: [0.1, 0.2] },
    }), { status: 200 }));
    const p = new ElevenLabsTTSProvider("key", "voice123", "eleven_multilingual_v2");
    const r = await p.synthesize({ text: "Hi", voiceId: "ignored-google-voice" });
    expect(r.ext).toBe("mp3");
    expect(r.durationMs).toBe(200);
    expect(r.wordTimings).toEqual([{ word: "Hi", startMs: 0 }]);
    expect(Buffer.from(r.audio).toString()).toBe("AUDIO");
    const url = (vi.mocked(fetch).mock.calls[0]![0] as string);
    expect(url).toContain("/v1/text-to-speech/voice123/with-timestamps");
  });
  it("throws on non-OK", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 401 }));
    const p = new ElevenLabsTTSProvider("key", "voice123", "eleven_multilingual_v2");
    await expect(p.synthesize({ text: "Hi", voiceId: "x" })).rejects.toThrow("401");
  });
});
