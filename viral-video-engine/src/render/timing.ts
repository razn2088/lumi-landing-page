import type { WordTiming } from "../types/domain.js";

export const FPS = 30;
export const END_CARD_TAIL_MS = 2500;

export function msToFrames(ms: number, fps = FPS): number {
  return Math.round((ms / 1000) * fps);
}

export function totalDurationInFrames(durationMs: number, fps = FPS): number {
  return Math.max(1, msToFrames(durationMs + END_CARD_TAIL_MS, fps));
}

/** Index of the last word whose startMs <= timeMs, or -1 before the first word. */
export function activeWordIndex(wordTimings: WordTiming[], timeMs: number): number {
  let idx = -1;
  for (const w of wordTimings) {
    if (w.startMs <= timeMs) idx += 1;
    else break;
  }
  return idx;
}

const SENTENCE_END = /[.!?]+["')\]]?$/;
const CLAUSE_END = /[,;:]$/;
/** Break word timings into short caption phrases (<= maxWords), splitting at sentence
 * ends, clause punctuation, or the word cap — so captions stay compact, never fragment
 * a phrase mid-thought, and never fill the screen. */
const NUMBER = /^\$?\d[\d.,]*\+?$/; // e.g. "7", "60", "$60", "5+"
export function captionChunks(words: WordTiming[], maxWords = 5): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let start = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!.word;
    const len = i - start + 1;
    const sentenceEnd = SENTENCE_END.test(w);
    const wantBreak = sentenceEnd || len >= maxWords || (CLAUSE_END.test(w) && len >= 3);
    // Never orphan a bare number from its unit ("7" | "inches"): keep it with the next word.
    const keepWithNext = NUMBER.test(w) && i + 1 < words.length && !sentenceEnd;
    if (wantBreak && !keepWithNext) {
      ranges.push([start, i]);
      start = i + 1;
    }
  }
  if (start < words.length) ranges.push([start, words.length - 1]);
  return ranges;
}
/** [start, endInclusive] of the caption phrase containing word `active`. */
export function chunkRangeFor(words: WordTiming[], active: number, maxWords = 5): [number, number] {
  for (const r of captionChunks(words, maxWords)) {
    if (active >= r[0] && active <= r[1]) return r;
  }
  return [active, active];
}

/** Tight phrase window for animated captions: 3-4 words at a time so it stays punchy
 * and readable, never the whole sentence. Thin wrapper over chunkRangeFor. */
export const CAPTION_PHRASE_WORDS = 4;
export function phraseRangeFor(words: WordTiming[], active: number): [number, number] {
  return chunkRangeFor(words, active, CAPTION_PHRASE_WORDS);
}

/** How long a word takes to animate in once it's spoken (ms). */
export const WORD_ENTER_MS = 200;
/** 0..1 entrance progress for the word at `index`, given the current time.
 * 0 before the word is spoken, ramps to 1 over WORD_ENTER_MS after its startMs.
 * Drives the per-word fade + upward rise so each word pops in as it's said. */
export function wordEntranceProgress(words: WordTiming[], index: number, timeMs: number, enterMs = WORD_ENTER_MS): number {
  const w = words[index];
  if (!w) return 0;
  const t = (timeMs - w.startMs) / Math.max(1, enterMs);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;
export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url);
}
