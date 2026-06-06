import type { TTSProvider, TTSRequest, TTSResult } from "../types.js";
import { buildMarkedSsml } from "../../text/narration.js";

const SAMPLE_RATE = 24000; // mono 16-bit LINEAR16 -> 48000 bytes/sec
const WAV_HEADER_BYTES = 44;

interface Timepoint { markName: string; timeSeconds: number; }

export class GoogleTTSProvider implements TTSProvider {
  readonly key = "google";
  constructor(private apiKey: string) {}

  async synthesize(req: TTSRequest): Promise<TTSResult> {
    const { ssml, words } = buildMarkedSsml(req.text);
    const res = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { ssml },
        voice: { languageCode: req.voiceId.split("-").slice(0, 2).join("-") || "en-US", name: req.voiceId },
        audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: SAMPLE_RATE },
        enableTimePointing: ["SSML_MARK"],
      }),
    });
    if (!res.ok) throw new Error(`Google TTS failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { audioContent: string; timepoints?: Timepoint[] };

    const audio = new Uint8Array(Buffer.from(json.audioContent, "base64"));
    const pcmBytes = Math.max(0, audio.byteLength - WAV_HEADER_BYTES);
    const durationMs = Math.round((pcmBytes / (SAMPLE_RATE * 2)) * 1000);

    const wordTimings = (json.timepoints ?? [])
      .map((tp) => ({ idx: Number.parseInt(tp.markName.slice(1), 10), startMs: Math.round(tp.timeSeconds * 1000) }))
      .filter((t) => Number.isInteger(t.idx) && t.idx >= 0 && t.idx < words.length)
      .sort((a, b) => a.idx - b.idx)
      .map((t) => ({ word: words[t.idx]!, startMs: t.startMs }));

    return { audio, durationMs, ext: "wav", wordTimings };
  }
}
