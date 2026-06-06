import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_SCHEMA: z.string().default("public"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-4-8"),
  GOOGLE_TTS_API_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().default("viral-video-assets"),
  WORKER_ID: z.string().default("worker-local"),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  return EnvSchema.parse(env);
}
