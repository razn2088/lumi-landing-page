import type { FC } from "react";
import { AbsoluteFill, Img, OffthreadVideo, useCurrentFrame, interpolate } from "remotion";
import { isVideoUrl } from "../src/render/timing.js";

// Clean, subtle, single-direction push-in (no pulsing) + a soft fade-in on the cut and an
// optional fade-out tail so adjacent sub-shots cross-dissolve instead of hard-cutting.
// The dynamic feel comes from cutting between distinct clips, not from zooming.
function useMotion(durationInFrames: number, fadeOutFrames: number) {
  const frame = useCurrentFrame();
  const dur = Math.max(1, durationInFrames);
  const scale = interpolate(frame, [0, dur], [1.0, 1.05], { extrapolateRight: "clamp" });
  const fadeIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  // Fade out across the overlap window (the frames this shot lingers past its cut, while the
  // next shot fades in over it), so the two cross-dissolve on the same frames.
  const fadeOut = fadeOutFrames > 0
    ? interpolate(frame, [dur, dur + fadeOutFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return { scale, opacity: Math.min(fadeIn, fadeOut) };
}

export const ClipLayer: FC<{ url: string | null; brandColor: string; durationInFrames: number; fadeOutFrames?: number }> = ({ url, brandColor, durationInFrames, fadeOutFrames = 0 }) => {
  const { scale, opacity } = useMotion(durationInFrames, fadeOutFrames);
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
