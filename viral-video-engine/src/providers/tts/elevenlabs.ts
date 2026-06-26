import type { TTSProvider, TTSRequest, TTSResult, WordTimingResult } from "../types.js";

export interface ElevenAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}
interface ElevenResponse { audio_base64: string; alignment: ElevenAlignment }

export function alignmentToWordTimings(al: ElevenAlignment): WordTimingResult[] {
  const out: WordTimingResult[] = [];
  let word = "";
  let wordStart = 0;
  let started = false;
  for (let i = 0; i < al.characters.length; i++) {
    const ch = al.characters[i] ?? "";
    if (/\s/.test(ch)) {
      if (word) { out.push({ word, startMs: Math.round(wordStart * 1000) }); word = ""; started = false; }
    } else {
      if (!started) { wordStart = al.character_start_times_seconds[i] ?? 0; started = true; }
      word += ch;
    }
  }
  if (word) out.push({ word, startMs: Math.round(wordStart * 1000) });
  return out;
}

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly key = "elevenlabs";
  constructor(private apiKey: string, private voiceId: string, private model: string, private speed = 1.0) {}

  async synthesize(req: TTSRequest): Promise<TTSResult> {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": this.apiKey, "Content-Type": "application/json", Accept: "application/json" },
        // speed > 1 tightens delivery and shortens the pauses between sentences.
        body: JSON.stringify({ text: req.text, model_id: this.model, voice_settings: { speed: this.speed } }),
      },
    );
    if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as ElevenResponse;
    const audio = new Uint8Array(Buffer.from(json.audio_base64, "base64"));
    const ends = json.alignment.character_end_times_seconds;
    const durationMs = Math.round((ends[ends.length - 1] ?? 0) * 1000);
    return { audio, durationMs, ext: "mp3", wordTimings: alignmentToWordTimings(json.alignment) };
  }
}
