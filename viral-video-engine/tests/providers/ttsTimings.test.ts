import { describe, it, expect, vi, afterEach } from "vitest";
import { GoogleTTSProvider } from "../../src/providers/tts/google.js";

function fakeWavBase64(pcmBytes: number): string {
  const buf = Buffer.alloc(44 + pcmBytes);
  buf.write("RIFF", 0, "ascii");
  buf.write("WAVE", 8, "ascii");
  return buf.toString("base64");
}

afterEach(() => vi.restoreAllMocks());

describe("GoogleTTSProvider word timings", () => {
  it("calls v1beta1 with marked SSML + timepointing and parses word timings", async () => {
    const captured: { url?: string; body?: any } = {};
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: any) => {
      captured.url = url;
      captured.body = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          audioContent: fakeWavBase64(24000), // 0.5s at 24kHz mono 16-bit: 24000 PCM bytes / (24000*2) * 1000 = 500ms
          timepoints: [
            { markName: "w0", timeSeconds: 0 },
            { markName: "w1", timeSeconds: 0.25 },
          ],
        }),
      } as any;
    }));

    const provider = new GoogleTTSProvider("KEY");
    const res = await provider.synthesize({ text: "buy now", voiceId: "en-US-Neural2-D" });

    expect(captured.url).toContain("/v1beta1/text:synthesize");
    expect(captured.body.enableTimePointing).toEqual(["SSML_MARK"]);
    expect(captured.body.input.ssml).toContain(`<mark name="w0"/>buy`);
    expect(res.ext).toBe("wav");
    expect(res.durationMs).toBe(500);
    expect(res.wordTimings).toEqual([
      { word: "buy", startMs: 0 },
      { word: "now", startMs: 250 },
    ]);
  });
});
