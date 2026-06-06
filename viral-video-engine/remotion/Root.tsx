import type { FC, ComponentType } from "react";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { VideoComposition } from "./VideoComposition.js";
import type { RenderProps } from "../src/render/props.js";
import { FPS, totalDurationInFrames } from "../src/render/timing.js";

// Remotion's Composition generic constrains Props to Record<string,unknown>.
// Extend RenderProps with an index signature to satisfy that constraint.
type RenderPropsRecord = RenderProps & Record<string, unknown>;

const defaultProps: RenderProps = {
  brandName: "Brand",
  handle: "@brand",
  logoUrl: null,
  brandColor: "#ffd60a",
  siteUrl: "https://example.com",
  voiceoverUrl: "",
  durationMs: 1000,
  musicUrl: null,
  segments: [],
  wordTimings: [],
};

// Cast component to the widened type Remotion's Composition generic expects.
const TypedComposition = Composition as unknown as FC<{
  id: string;
  component: ComponentType<RenderPropsRecord>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps: RenderPropsRecord;
  calculateMetadata: CalculateMetadataFunction<RenderPropsRecord>;
}>;

const calcMetadata: CalculateMetadataFunction<RenderPropsRecord> = ({ props }) => ({
  durationInFrames: totalDurationInFrames(props.durationMs),
});

export const RemotionRoot: FC = () => {
  return (
    <TypedComposition
      id="video"
      component={VideoComposition as ComponentType<RenderPropsRecord>}
      durationInFrames={totalDurationInFrames(defaultProps.durationMs)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps as RenderPropsRecord}
      calculateMetadata={calcMetadata}
    />
  );
};
