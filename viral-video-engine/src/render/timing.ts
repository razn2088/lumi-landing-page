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

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;
export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url);
}
