import { describe, it, expect, vi, afterEach } from "vitest";
import { GoogleTTSProvider } from "../../src/providers/tts/google.js";

afterEach(() => vi.restoreAllMocks());

describe("GoogleTTSProvider", () => {
  it("posts marked SSML to the v1beta1 endpoint and computes duration from LINEAR16 bytes", async () => {
    const pcm = new Uint8Array(44 + 48000); // 44-byte WAV header + 48000 bytes PCM = 1.0s @ 24000Hz mono 16-bit
    const b64 = Buffer.from(pcm).toString("base64");
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ audioContent: b64, timepoints: [{ markName: "w0", timeSeconds: 0 }] }), { status: 200 }),
    );
    const tts = new GoogleTTSProvider("KEY");
    const r = await tts.synthesize({ text: "hello", voiceId: "en-US-Neural2-D" });

    expect(r.ext).toBe("wav");
    expect(r.audio.byteLength).toBe(44 + 48000);
    expect(r.durationMs).toBe(1000);

    const url = spy.mock.calls[0]![0] as string;
    expect(url).toContain("texttospeech.googleapis.com/v1beta1/text:synthesize");
    expect(url).toContain("key=KEY");

    const body = JSON.parse((spy.mock.calls[0]![1] as any).body);
    expect(body.enableTimePointing).toEqual(["SSML_MARK"]);
    expect(body.input.ssml).toContain(`<mark name="w0"/>hello`);

    expect(r.wordTimings).toEqual([{ word: "hello", startMs: 0 }]);
  });

  it("throws on a non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 403 }));
    await expect(new GoogleTTSProvider("KEY").synthesize({ text: "x", voiceId: "v" })).rejects.toThrow("403");
  });
});
