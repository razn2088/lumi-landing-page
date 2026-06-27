import type { FC } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "../src/types/domain.js";
import { activeWordIndex, phraseRangeFor } from "../src/render/timing.js";

const NUM = /^\$?\d[\d.,]*\+?$/;

// Submagic / Hormozi-style animated captions: a tight 3-4 word window, each word
// springs in as it's spoken (scale-up + rise + fade), the active word pops on a
// bright accent pill, and a heavy stroke + layered shadow keep it readable on any footage.
export const KaraokeCaptions: FC<{ wordTimings: WordTiming[]; brandColor: string }> = ({ wordTimings, brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const active = activeWordIndex(wordTimings, timeMs);
  if (active < 0) return null;

  const [start, end] = phraseRangeFor(wordTimings, active);
  const phrase = wordTimings.slice(start, end + 1);

  // Keep a number and its following word on the same line ("7 inches") so a unit never wraps alone.
  const groups: number[][] = [];
  for (let i = 0; i < phrase.length; ) {
    if (NUM.test(phrase[i]!.word) && i + 1 < phrase.length) { groups.push([start + i, start + i + 1]); i += 2; }
    else { groups.push([start + i]); i += 1; }
  }

  const wordSpan = (absIdx: number) => {
    const w = wordTimings[absIdx]!;
    const isActive = absIdx === active;
    const spoken = absIdx <= active;
    const startFrame = (w.startMs / 1000) * fps;
    const framesSince = frame - startFrame;

    // Entrance: a quick spring scale-up with a touch of overshoot, plus an eased rise + fade,
    // keyed to THIS word's own start so words pop in one after another as they're spoken.
    const enter = spring({ frame: framesSince, fps, config: { damping: 16, mass: 0.5, stiffness: 170 }, durationInFrames: 9 });
    const rise = interpolate(enter, [0, 1], [26, 0]);
    const opacity = spoken ? interpolate(enter, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.16;

    // Active emphasis: a brief pop overshoot the moment a word becomes current, then settle.
    const pop = isActive ? spring({ frame: framesSince, fps, config: { damping: 11, mass: 0.4, stiffness: 200 }, durationInFrames: 8 }) : 0;
    const baseScale = spoken ? interpolate(enter, [0, 1], [0.86, 1]) : 0.92;
    const scale = baseScale + (isActive ? 0.06 + pop * 0.05 : 0);

    return (
      <span
        key={absIdx}
        style={{
          display: "inline-block",
          margin: "4px 7px",
          padding: isActive ? "4px 20px" : "4px 6px",
          borderRadius: 16,
          transform: `translateY(${rise}px) scale(${scale})`,
          transformOrigin: "center bottom",
          opacity,
          color: isActive ? "#0b0b0f" : "#fff",
          backgroundColor: isActive ? brandColor : "transparent",
          boxShadow: isActive ? `0 10px 30px ${brandColor}66, 0 0 0 4px rgba(0,0,0,0.85)` : "none",
          WebkitTextStroke: isActive ? "0px transparent" : "9px rgba(0,0,0,0.92)",
          // paint stroke behind the fill so the glyph stays crisp
          paintOrder: "stroke fill" as const,
          textShadow: isActive ? "none" : "0 5px 0 rgba(0,0,0,0.9), 0 0 22px rgba(0,0,0,0.7)",
        }}
      >
        {w.word}
      </span>
    );
  };

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 56px 360px" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 1.06,
          letterSpacing: -1,
          textTransform: "uppercase",
          color: "#fff",
        }}
      >
        {groups.map((idxs, gi) =>
          idxs.length > 1
            ? <span key={gi} style={{ whiteSpace: "nowrap" }}>{idxs.map(wordSpan)}</span>
            : wordSpan(idxs[0]!),
        )}
      </div>
    </AbsoluteFill>
  );
};
