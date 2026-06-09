import "server-only";
import { createDataClient } from "./supabase/data";

const TOKEN_KEY = "ig_system_user_token";

export interface ConnectionBrand { id: string; name: string; igUserId: string | null; igUsername: string | null; igEnabled: boolean }

export function parseAccountValue(value: string): { igUserId: string; username: string } {
  const [igUserId, username = ""] = value.split("|");
  return { igUserId: igUserId ?? "", username };
}

export async function getSystemUserToken(): Promise<string | null> {
  const sb = createDataClient();
  const { data, error } = await sb.from("app_config").select("value").eq("key", TOKEN_KEY).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function setSystemUserToken(token: string): Promise<void> {
  const sb = createDataClient();
  const { error } = await sb.from("app_config").upsert({ key: TOKEN_KEY, value: token, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function getConnectionBrands(): Promise<ConnectionBrand[]> {
  const sb = createDataClient();
  const { data, error } = await sb.from("brands").select("id,name,ig_user_id,ig_username,ig_enabled").eq("active", true).order("name");
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({ id: r.id as string, name: r.name as string, igUserId: (r.ig_user_id as string | null) ?? null, igUsername: (r.ig_username as string | null) ?? null, igEnabled: (r.ig_enabled as boolean | null) ?? false }));
}

export async function connectBrandAccount(brandId: string, igUserId: string, username: string): Promise<void> {
  const sb = createDataClient();
  const { error } = await sb.from("brands").update({ ig_user_id: igUserId, ig_username: username, ig_enabled: true }).eq("id", brandId);
  if (error) throw error;
}

export async function disconnectBrandAccount(brandId: string): Promise<void> {
  const sb = createDataClient();
  const { error } = await sb.from("brands").update({ ig_user_id: null, ig_username: null, ig_enabled: false }).eq("id", brandId);
  if (error) throw error;
}
