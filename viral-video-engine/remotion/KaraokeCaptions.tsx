import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "../src/types/domain.js";
import { activeWordIndex, chunkRangeFor } from "../src/render/timing.js";

export const KaraokeCaptions: FC<{ wordTimings: WordTiming[]; brandColor: string }> = ({ wordTimings, brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const active = activeWordIndex(wordTimings, timeMs);
  if (active < 0) return null;
  const [start, end] = chunkRangeFor(wordTimings, active);
  const phrase = wordTimings.slice(start, end + 1);
  // Keep a number and its following word on the same line ("7 inches"): group them in a nowrap span.
  const NUM = /^\$?\d[\d.,]*\+?$/;
  const groups: number[][] = [];
  for (let i = 0; i < phrase.length; ) {
    if (NUM.test(phrase[i]!.word) && i + 1 < phrase.length) { groups.push([start + i, start + i + 1]); i += 2; }
    else { groups.push([start + i]); i += 1; }
  }
  const wordSpan = (absIdx: number) => {
    const isActive = absIdx === active;
    return (
      <span key={absIdx} style={{ margin: "3px 8px", display: "inline-block", color: isActive ? "#111" : "#fff", backgroundColor: isActive ? brandColor : "transparent", padding: isActive ? "2px 14px" : "2px 0", borderRadius: 10 }}>
        {wordTimings[absIdx]!.word}
      </span>
    );
  };
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 70px 300px" }}>
      <div style={{ textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 80, lineHeight: 1.15, textTransform: "uppercase", color: "#fff", textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,0.6)" }}>
        {groups.map((idxs, gi) =>
          idxs.length > 1
            ? <span key={gi} style={{ whiteSpace: "nowrap" }}>{idxs.map(wordSpan)}</span>
            : wordSpan(idxs[0]!),
        )}
      </div>
    </AbsoluteFill>
  );
};
