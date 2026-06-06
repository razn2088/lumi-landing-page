import type { TTSProvider, TTSRequest, TTSResult } from "../types.js";
import { tokenizeWords } from "../../text/narration.js";

export class FakeTTSProvider implements TTSProvider {
  readonly key = "fake";
  async synthesize(req: TTSRequest): Promise<TTSResult> {
    const words = tokenizeWords(req.text);
    const durationMs = Math.max(1, words.length * 300);
    const per = durationMs / Math.max(1, words.length);
    const wordTimings = words.map((word, i) => ({ word, startMs: Math.round(i * per) }));
    const audio = new Uint8Array(44); // minimal placeholder WAV header
    return { audio, durationMs, ext: "wav", wordTimings };
  }
}
