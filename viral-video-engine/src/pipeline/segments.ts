import type { Script, Segment, WordTiming } from "../types/domain.js";
import { tokenizeWords } from "../text/narration.js";

/**
 * Maps the script onto the narration's word timings to produce a timeline.
 * `beatClips[i]` is the resolved clip for beat i (or null). The hook reuses
 * the first beat's clip; the cta has no clip (rendered as the end card).
 */
export function buildSegments(
  script: Script,
  beatClips: (string | null)[],
  wordTimings: WordTiming[],
  totalDurationMs: number,
): Segment[] {
  const planned: Array<{ role: Segment["role"]; beatIndex?: number; text: string; wordCount: number; clipUrl: string | null }> = [];
  planned.push({ role: "hook", text: script.hook, wordCount: tokenizeWords(script.hook).length, clipUrl: beatClips[0] ?? null });
  script.beats.forEach((b, i) =>
    planned.push({ role: "beat", beatIndex: i, text: b.voiceover, wordCount: tokenizeWords(b.voiceover).length, clipUrl: beatClips[i] ?? null }),
  );
  planned.push({ role: "cta", text: script.cta, wordCount: tokenizeWords(script.cta).length, clipUrl: null });

  const segments: Segment[] = [];
  let wordIdx = 0;
  for (const p of planned) {
    const startIdx = wordIdx;
    wordIdx += p.wordCount;
    const startMs = wordTimings[startIdx]?.startMs ?? (segments.length ? segments[segments.length - 1]!.endMs : 0);
    const endMs = wordTimings[wordIdx]?.startMs ?? totalDurationMs;
    segments.push({ role: p.role, beatIndex: p.beatIndex, text: p.text, startMs, endMs, clipUrl: p.clipUrl });
  }
  return segments;
}
