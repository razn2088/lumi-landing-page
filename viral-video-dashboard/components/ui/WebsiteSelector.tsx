import Link from "next/link";
import type { BrandRow } from "../../lib/brands";

export function WebsiteSelector({
  brands,
  selectedId,
  filter,
}: {
  brands: BrandRow[];
  selectedId: string;
  filter: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {brands.map((b) => {
        const active = b.id === selectedId;
        return (
          <Link
            key={b.id}
            href={`/articles?brand=${b.id}&filter=${filter}`}
            className="vs-pill"
            aria-current={active ? "true" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "5px 14px 5px 5px",
              borderRadius: 999,
              textDecoration: "none",
              background: active ? "var(--text)" : "var(--surface)",
              color: active ? "#fff" : "var(--text)",
              border: active ? "1px solid var(--text)" : "1px solid var(--border)",
              boxShadow: active ? "var(--shadow)" : "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: b.brandColor ?? "#445",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: active ? "0 0 0 2px rgba(255,255,255,.25)" : "0 0 0 2px var(--surface-2)",
              }}
            >
              {b.logoUrl ? (
                <img src={b.logoUrl} alt="" width={24} height={24} style={{ objectFit: "cover" }} />
              ) : (
                (b.name[0] ?? "?").toUpperCase()
              )}
            </span>
            {b.name}
          </Link>
        );
      })}
    </div>
  );
}
