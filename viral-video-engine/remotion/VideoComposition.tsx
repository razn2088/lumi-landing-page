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
      {props.segments
        .filter((s) => s.role !== "cta")
        .map((seg, i) => {
          const from = msToFrames(seg.startMs, fps);
          const dur = Math.max(1, msToFrames(seg.endMs, fps) - from);
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <ClipLayer url={seg.clipUrl} brandColor={props.brandColor} durationInFrames={dur} />
            </Sequence>
          );
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
