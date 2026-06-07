import Link from "next/link";
import type { DashboardBrand } from "../lib/types";
export function BrandFilter({ brands, status, brandId }: { brands: DashboardBrand[]; status: string; brandId?: string }) {
  const opt = (id: string | undefined, label: string) => {
    const params = new URLSearchParams({ status, ...(id ? { brand: id } : {}) });
    const on = id === brandId || (!id && !brandId);
    return <Link key={label} href={`/review?${params.toString()}`} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, textDecoration: "none", background: on ? "#fff" : "rgba(255,255,255,.14)", color: on ? "#0f1830" : "#fff" }}>{label}</Link>;
  };
  return <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>{opt(undefined, "All")}{brands.map((b) => opt(b.id, b.name))}</div>;
}
