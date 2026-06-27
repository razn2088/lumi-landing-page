import "server-only";
import { createDataClient } from "./supabase/data";

export interface NewBrandInput {
  name: string;
  siteUrl: string;
  niche: string;
  tone: string;
  brandColor: string;
  useFeaturedImageBeat: boolean;
}

export interface BrandInputError { field: "name" | "siteUrl" | "niche" | "tone"; message: string }

export function slugifyBrandId(name: string, existingIds: string[]): string {
  const base =
    name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "").slice(0, 40) || "brand";
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function deriveWpApiBase(siteUrl: string): string {
  return `${siteUrl.trim().replace(/\/+$/, "")}/wp-json/wp/v2`;
}

export function validateBrandInput(input: Partial<NewBrandInput>): BrandInputError | null {
  if (!input.name?.trim()) return { field: "name", message: "Name is required." };
  if (!input.siteUrl?.trim()) return { field: "siteUrl", message: "Site URL is required." };
  try { new URL(input.siteUrl); } catch { return { field: "siteUrl", message: "Site URL must be a valid URL (include https://)." }; }
  if (!input.niche?.trim()) return { field: "niche", message: "Niche is required." };
  if (!input.tone?.trim()) return { field: "tone", message: "Tone is required." };
  return null;
}

/** Light check that the WordPress REST API responds, to catch a typo'd URL on add. */
export async function wordpressReachable(wpApiBase: string): Promise<boolean> {
  try {
    const res = await fetch(`${wpApiBase}/posts?per_page=1`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listBrandIds(): Promise<string[]> {
  const sb = createDataClient();
  const { data, error } = await sb.from("brands").select("id");
  if (error) throw error;
  return (data ?? []).map((r: { id: string }) => r.id);
}

export async function createBrand(input: NewBrandInput): Promise<void> {
  const sb = createDataClient();
  const id = slugifyBrandId(input.name, await listBrandIds());
  const { error } = await sb.from("brands").insert({
    id,
    name: input.name.trim(),
    site_url: input.siteUrl.trim(),
    wp_api_base: deriveWpApiBase(input.siteUrl),
    niche: input.niche.trim(),
    tone: input.tone.trim(),
    brand_color: input.brandColor || "#ffd60a",
    use_featured_image_beat: input.useFeaturedImageBeat,
    active: true,
  });
  if (error) throw error;
}

export async function setBrandActive(id: string, active: boolean): Promise<void> {
  const sb = createDataClient();
  const { error } = await sb.from("brands").update({ active }).eq("id", id);
  if (error) throw error;
}

/** FK-safe cascade: posts -> articles -> brand (these FKs have no ON DELETE CASCADE). */
export async function deleteBrand(id: string): Promise<void> {
  const sb = createDataClient();
  const posts = await sb.from("posts").delete().eq("brand_id", id);
  if (posts.error) throw posts.error;
  const articles = await sb.from("articles").delete().eq("brand_id", id);
  if (articles.error) throw articles.error;
  const brand = await sb.from("brands").delete().eq("id", id);
  if (brand.error) throw brand.error;
}
