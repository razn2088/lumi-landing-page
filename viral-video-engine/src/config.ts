import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  WORKER_ID: z.string().default("worker-local"),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  return EnvSchema.parse(env);
}
