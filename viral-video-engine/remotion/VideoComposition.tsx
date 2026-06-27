import type { FC } from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { RenderProps } from "../src/render/props.js";
import { msToFrames } from "../src/render/timing.js";
import { ClipLayer } from "./ClipLayer.js";
import { KaraokeCaptions } from "./KaraokeCaptions.js";
import { Overlays } from "./Overlays.js";
import { EndCard } from "./EndCard.js";

export const VideoComposition: FC<RenderProps> = (props) => {
  const { fps } = useVideoConfig();
  const ctaSeg = props.segments.find((s) => s.role === "cta");
  const ctaStartFrame = Math.max(1, msToFrames(ctaSeg ? ctaSeg.startMs : props.durationMs, fps));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {props.segments.filter((s) => s.role !== "cta").flatMap((seg, si) => {
        const clips = seg.clips.length ? seg.clips : (seg.clipUrl ? [seg.clipUrl] : []);
        if (!clips.length) return [];
        const segDur = Math.max(1, seg.endMs - seg.startMs);
        // Fast cuts to DISTINCT clips at a ~1.8s target, capped at how many distinct
        // clips we have so we never repeat one. Energy comes from cutting + clean motion.
        const n = Math.min(Math.max(1, Math.round(segDur / 1800)), clips.length);
        return Array.from({ length: n }, (_, k) => {
          const from = msToFrames(seg.startMs + (segDur * k) / n, fps);
          const to = msToFrames(seg.startMs + (segDur * (k + 1)) / n, fps);
          const dur = Math.max(1, to - from);
          return (
            <Sequence key={`${si}-${k}`} from={from} durationInFrames={dur}>
              <ClipLayer url={clips[k]!} brandColor={props.brandColor} durationInFrames={dur} />
            </Sequence>
          );
        });
      })}

      <Sequence durationInFrames={ctaStartFrame}>
        <KaraokeCaptions wordTimings={props.wordTimings} brandColor={props.brandColor} />
      </Sequence>

      <Overlays handle={props.handle} />

      <Sequence from={ctaStartFrame}>
        <EndCard brandName={props.brandName} siteUrl={props.siteUrl} logoUrl={props.logoUrl} brandColor={props.brandColor} />
      </Sequence>

      <Audio src={props.voiceoverUrl} />
      {props.musicUrl ? <Audio src={props.musicUrl} volume={0.18} loop /> : null}
    </AbsoluteFill>
  );
};
