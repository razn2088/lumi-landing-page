import type { Script, Segment, WordTiming } from "../types/domain.js";
import { tokenizeWords } from "../text/narration.js";

/** A resolved pool of clips for one beat: several URLs (broll) or product images. */
export interface BeatPool {
  clips: string[];
  clipKind: "image" | "video";
}

/**
 * Maps the script onto the narration's word timings to produce a timeline.
 * `beatPools[i]` is the resolved clip pool for beat i. The hook reuses the
 * first beat's pool; the cta has no clips (rendered as the end card).
 * `clipUrl` is kept as `clips[0] ?? null` for back-compat.
 */
export function buildSegments(
  script: Script,
  beatPools: BeatPool[],
  wordTimings: WordTiming[],
  totalDurationMs: number,
): Segment[] {
  const empty: BeatPool = { clips: [], clipKind: "video" };
  const planned: Array<{ role: Segment["role"]; beatIndex?: number; text: string; wordCount: number; pool: BeatPool }> = [];
  planned.push({ role: "hook", text: script.hook, wordCount: tokenizeWords(script.hook).length, pool: beatPools[0] ?? empty });
  script.beats.forEach((b, i) =>
    planned.push({ role: "beat", beatIndex: i, text: b.voiceover, wordCount: tokenizeWords(b.voiceover).length, pool: beatPools[i] ?? empty }),
  );
  planned.push({ role: "cta", text: script.cta, wordCount: tokenizeWords(script.cta).length, pool: empty });

  const segments: Segment[] = [];
  let wordIdx = 0;
  for (const p of planned) {
    const startIdx = wordIdx;
    wordIdx += p.wordCount;
    const startMs = wordTimings[startIdx]?.startMs ?? (segments.length ? segments[segments.length - 1]!.endMs : 0);
    const endMs = wordTimings[wordIdx]?.startMs ?? totalDurationMs;
    segments.push({
      role: p.role,
      beatIndex: p.beatIndex,
      text: p.text,
      startMs,
      endMs,
      clipUrl: p.pool.clips[0] ?? null,
      clipKind: p.pool.clipKind,
      clips: p.pool.clips,
    });
  }
  return segments;
}
