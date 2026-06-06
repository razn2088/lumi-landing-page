import type { Brand, Post, Segment, WordTiming } from "../types/domain.js";

export interface RenderProps {
  brandName: string;
  handle: string;
  logoUrl: string | null;
  brandColor: string;
  siteUrl: string;
  voiceoverUrl: string;
  durationMs: number;
  musicUrl: string | null;
  segments: Segment[];
  wordTimings: WordTiming[];
}

export function buildRenderProps(post: Post, brand: Brand, musicUrl: string | null): RenderProps {
  if (!post.assets) throw new Error(`Post ${post.id} has no assets`);
  return {
    brandName: brand.name,
    handle: brand.handle || `@${brand.id}`,
    logoUrl: brand.logoUrl,
    brandColor: brand.brandColor,
    siteUrl: brand.siteUrl,
    voiceoverUrl: post.assets.voiceoverUrl,
    durationMs: post.assets.voiceoverDurationMs,
    musicUrl,
    segments: post.assets.segments,
    wordTimings: post.assets.wordTimings,
  };
}
