import type { FC } from "react";
import { AbsoluteFill, Img, OffthreadVideo, useCurrentFrame, interpolate } from "remotion";
import { isVideoUrl } from "../src/render/timing.js";

// Clean, subtle, single-direction push-in (no pulsing) + a soft fade-in on the cut.
// The dynamic feel comes from cutting between distinct clips, not from zooming.
function useMotion(durationInFrames: number) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames)], [1.0, 1.05], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return { scale, opacity };
}

export const ClipLayer: FC<{ url: string | null; brandColor: string; durationInFrames: number }> = ({ url, brandColor, durationInFrames }) => {
  const { scale, opacity } = useMotion(durationInFrames);
  if (!url) return <AbsoluteFill style={{ backgroundColor: brandColor }} />;
  if (isVideoUrl(url)) {
    return (
      <AbsoluteFill style={{ opacity }}>
        <OffthreadVideo src={url} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.55)", transform: `scale(${scale + 0.12})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img src={url} style={{ maxWidth: "92%", maxHeight: "78%", objectFit: "contain", transform: `scale(${scale})` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
