import type { FC } from "react";
import { AbsoluteFill, Img, OffthreadVideo, useCurrentFrame, interpolate } from "remotion";
import { isVideoUrl } from "../src/render/timing.js";

export const ClipLayer: FC<{ url: string | null; brandColor: string; durationInFrames: number }> = ({ url, brandColor, durationInFrames }) => {
  const frame = useCurrentFrame();
  if (!url) return <AbsoluteFill style={{ backgroundColor: brandColor }} />;
  if (isVideoUrl(url)) {
    return (
      <AbsoluteFill>
        <OffthreadVideo src={url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames)], [1, 1.08], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.55)", transform: `scale(${scale + 0.12})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img src={url} style={{ maxWidth: "92%", maxHeight: "78%", objectFit: "contain", transform: `scale(${scale})` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
