import type { TTSProvider, TTSRequest, TTSResult } from "../types.js";

const SAMPLE_RATE = 24000; // mono 16-bit LINEAR16 -> 48000 bytes/sec
const WAV_HEADER_BYTES = 44;

export class GoogleTTSProvider implements TTSProvider {
  readonly key = "google";
  constructor(private apiKey: string) {}

  async synthesize(req: TTSRequest): Promise<TTSResult> {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: req.text },
        voice: { languageCode: req.voiceId.split("-").slice(0, 2).join("-") || "en-US", name: req.voiceId },
        audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: SAMPLE_RATE },
      }),
    });
    if (!res.ok) throw new Error(`Google TTS failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { audioContent: string };
    const audio = new Uint8Array(Buffer.from(json.audioContent, "base64"));
    const pcmBytes = Math.max(0, audio.byteLength - WAV_HEADER_BYTES);
    const durationMs = Math.round((pcmBytes / (SAMPLE_RATE * 2)) * 1000);
    return { audio, durationMs, ext: "wav" };
  }
}
