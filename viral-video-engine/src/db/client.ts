import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "../config.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseClient(cfg: Config): SupabaseClient<any, any, any> {
  return createClient(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: cfg.SUPABASE_SCHEMA },
  }) as SupabaseClient<any, any, any>;
}
