import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardBrand, DashboardPost, PostStatus } from "./types";

type EmbeddedBrand = { name?: string | null; handle?: string | null };

export function rowToPost(r: Record<string, any>): DashboardPost {
  const b: EmbeddedBrand = Array.isArray(r.brands) ? (r.brands[0] ?? {}) : (r.brands ?? {});
  return {
    id: r.id,
    brandId: r.brand_id,
    brandName: b.name ?? r.brand_id,
    brandHandle: b.handle ?? "",
    script: r.script,
    caption: r.caption ?? "",
    hashtags: r.hashtags ?? [],
    videoUrl: r.video_url ?? null,
    status: r.status,
    createdAt: r.created_at,
  };
}

const SELECT = "id,brand_id,script,caption,hashtags,video_url,status,created_at,brands(name,handle)";

export async function listPosts(sb: SupabaseClient<any, any, any>, status: PostStatus, brandId?: string): Promise<DashboardPost[]> {
  let q = sb.from("posts").select(SELECT).eq("status", status).order("created_at", { ascending: false });
  if (brandId) q = q.eq("brand_id", brandId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToPost);
}

export async function getBrands(sb: SupabaseClient<any, any, any>): Promise<DashboardBrand[]> {
  const { data, error } = await sb.from("brands").select("id,name").eq("active", true).order("name");
  if (error) throw error;
  return (data ?? []).map((r: Record<string, any>) => ({ id: r.id, name: r.name }));
}

export async function setPostStatus(sb: SupabaseClient<any, any, any>, id: string, status: PostStatus): Promise<void> {
  const { error } = await sb.from("posts").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}
