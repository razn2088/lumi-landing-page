import "server-only";
import { createDataClient } from "./supabase/data";

export interface BrandRow {
  id: string; name: string; logoUrl: string | null; brandColor: string | null;
  siteUrl: string | null; igUsername: string | null; igEnabled: boolean;
}

export function rowToBrand(r: Record<string, unknown>): BrandRow {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "Untitled",
    logoUrl: (r.logo_url as string) ?? null,
    brandColor: (r.brand_color as string) ?? null,
    siteUrl: (r.site_url as string) ?? null,
    igUsername: (r.ig_username as string) ?? null,
    igEnabled: Boolean(r.ig_enabled),
  };
}

export function resolveSelectedBrand(brands: BrandRow[], param: string | undefined): BrandRow | null {
  if (brands.length === 0) return null;
  if (param) { const m = brands.find((b) => b.id === param); if (m) return m; }
  return brands[0];
}

export async function getActiveBrands(): Promise<BrandRow[]> {
  const sb = createDataClient();
  const { data, error } = await sb.from("brands")
    .select("id,name,logo_url,brand_color,site_url,ig_username,ig_enabled")
    .eq("active", true).order("name");
  if (error) throw error;
  return (data ?? []).map(rowToBrand);
}
