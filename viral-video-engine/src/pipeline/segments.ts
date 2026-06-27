import type { Script, Segment, WordTiming } from "../types/domain.js";
import { tokenizeWords } from "../text/narration.js";

/** A resolved pool of clips for one beat: several URLs (broll) or product images. */
export interface BeatPool {
  clips: string[];
  clipKind: "image" | "video";
}

/**
 * Maps the script onto the narration's word timings to produce a timeline.
 * `beatPools[i]` is the resolved clip pool for beat i. The hook is merged into the
 * first beat as ONE continuous shot (so the first clip never restarts/repeats); the
 * cta has no clips (rendered as the end card). `clipUrl` = `clips[0] ?? null`.
 */
export function buildSegments(
  script: Script,
  beatPools: BeatPool[],
  wordTimings: WordTiming[],
  totalDurationMs: number,
): Segment[] {
  const empty: BeatPool = { clips: [], clipKind: "video" };
  const firstVo = script.beats[0]?.voiceover ?? "";
  const planned: Array<{ role: Segment["role"]; beatIndex?: number; text: string; wordCount: number; pool: BeatPool }> = [];
  // Hook + first beat = one continuous shot on the first beat's clip.
  planned.push({
    role: "hook",
    beatIndex: 0,
    text: `${script.hook} ${firstVo}`.trim(),
    wordCount: tokenizeWords(script.hook).length + tokenizeWords(firstVo).length,
    pool: beatPools[0] ?? empty,
  });
  script.beats.slice(1).forEach((b, i) =>
    planned.push({ role: "beat", beatIndex: i + 1, text: b.voiceover, wordCount: tokenizeWords(b.voiceover).length, pool: beatPools[i + 1] ?? empty }),
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
