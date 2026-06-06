import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "../src/types/domain.js";
import { activeWordIndex } from "../src/render/timing.js";

export const KaraokeCaptions: FC<{ wordTimings: WordTiming[]; brandColor: string }> = ({ wordTimings, brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const active = activeWordIndex(wordTimings, timeMs);
  if (active < 0) return null;
  const start = Math.max(0, active - 1);
  const windowWords = wordTimings.slice(start, start + 4);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
      <div style={{ textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 92, lineHeight: 1.1, textTransform: "uppercase", color: "#fff", textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,0.6)" }}>
        {windowWords.map((w, i) => {
          const isActive = start + i === active;
          return (
            <span key={start + i} style={{ margin: "0 10px", display: "inline-block", color: isActive ? "#111" : "#fff", backgroundColor: isActive ? brandColor : "transparent", padding: isActive ? "2px 14px" : 0, borderRadius: 10 }}>
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
