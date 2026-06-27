import Link from "next/link";
import type { StatusSummary } from "../../lib/articles";

const ITEMS: { key: string; label: string; color: string }[] = [
  { key: "new", label: "New", color: "#5b6577" },
  { key: "in_progress", label: "In progress", color: "#b07400" },
  { key: "created", label: "Created", color: "#2f6bff" },
  { key: "published", label: "Published", color: "#128a5e" },
  { key: "all", label: "All", color: "#3a4252" },
];

export function SummaryStrip({
  summary,
  brandId,
  filter,
}: {
  summary: StatusSummary;
  brandId: string;
  filter: string;
}) {
  const total = summary.new + summary.in_progress + summary.created + summary.published;
  const countFor = (key: string) => (key === "all" ? total : summary[key as keyof StatusSummary]);

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {ITEMS.map((it) => {
        const active = it.key === filter;
        return (
          <Link
            key={it.key}
            href={`/articles?brand=${brandId}&filter=${it.key}`}
            className="vs-stat"
            data-active={active ? "true" : undefined}
            aria-current={active ? "page" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              background: active ? `${it.color}14` : "var(--surface)",
              border: `1px solid ${active ? it.color : "var(--border)"}`,
              borderRadius: 12,
              boxShadow: active ? `0 0 0 3px ${it.color}22` : "var(--shadow)",
              textDecoration: "none",
            }}
          >
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: it.color, flexShrink: 0 }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>
              {countFor(it.key)}
            </span>
            <span style={{ fontSize: 12, color: active ? it.color : "var(--text-muted)", fontWeight: 700 }}>{it.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
