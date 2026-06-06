import { z } from "zod";

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  siteUrl: z.string().url(),
  wpApiBase: z.string().url(),
  niche: z.string().default(""),
  tone: z.string().default(""),
  useFeaturedImageBeat: z.boolean().default(false),
  active: z.boolean().default(true),
});
export type Brand = z.infer<typeof BrandSchema>;

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string(),
  wpPostId: z.number().int(),
  url: z.string().url(),
  title: z.string(),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  imageUrls: z.array(z.string()).default([]),
  featuredImageUrl: z.string().nullable().default(null),
  contentHash: z.string().min(1),
  publishedAt: z.string(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const JobTypeSchema = z.enum(["scan", "generate", "assets", "render", "publish"]);
export type JobType = z.infer<typeof JobTypeSchema>;

export const JobStatusSchema = z.enum(["queued", "processing", "done", "dead"]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobSchema = z.object({
  id: z.string().uuid(),
  type: JobTypeSchema,
  status: JobStatusSchema.default("queued"),
  attempts: z.number().int().default(0),
  maxAttempts: z.number().int().default(5),
  idempotencyKey: z.string().min(1),
  payload: z.record(z.unknown()).default({}),
  lastError: z.string().nullable().default(null),
  runAfter: z.string(),
});
export type Job = z.infer<typeof JobSchema>;

export const ScriptBeatSchema = z.object({
  kind: z.enum(["broll", "product_image"]).default("broll"),
  voiceover: z.string().min(1),
  brollKeywords: z.array(z.string()).default([]),
  onScreenText: z.string().optional(),
});
export type ScriptBeat = z.infer<typeof ScriptBeatSchema>;

export const ScriptSchema = z.object({
  hook: z.string().min(1),
  beats: z.array(ScriptBeatSchema).min(1),
  cta: z.string().min(1),
});
export type Script = z.infer<typeof ScriptSchema>;

export const GeneratedContentSchema = z.object({
  script: ScriptSchema,
  caption: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

export const PostAssetsSchema = z.object({
  voiceoverUrl: z.string().url(),
  voiceoverDurationMs: z.number().int().positive(),
  clipUrls: z.array(z.string().url()).default([]),
});
export type PostAssets = z.infer<typeof PostAssetsSchema>;

export const PostSchema = z.object({
  id: z.string().uuid(),
  articleId: z.string().uuid(),
  brandId: z.string(),
  script: ScriptSchema,
  caption: z.string(),
  hashtags: z.array(z.string()).default([]),
  status: z.string().default("pending_review"),
  createdAt: z.string(),
});
export type Post = z.infer<typeof PostSchema>;
