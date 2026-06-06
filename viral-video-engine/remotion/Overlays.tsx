import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Overlays: FC<{ handle: string }> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = Math.min(100, (frame / Math.max(1, durationInFrames)) * 100);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 40, left: 40, right: 40, height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4 }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#fff", borderRadius: 4 }} />
      </div>
      <div style={{ position: "absolute", top: 64, left: 44, color: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: 34, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{handle}</div>
    </AbsoluteFill>
  );
};
