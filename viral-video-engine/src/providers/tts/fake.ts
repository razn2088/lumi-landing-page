import type { TTSProvider, TTSRequest, TTSResult } from "../types.js";

export class FakeTTSProvider implements TTSProvider {
  readonly key = "fake";
  async synthesize(req: TTSRequest): Promise<TTSResult> {
    const durationMs = Math.max(1000, req.text.length * 80);
    return { audio: new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0]), durationMs, ext: "wav" };
  }
}
