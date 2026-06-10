import type { StatusSummary } from "../../lib/articles";

const ITEMS: { key: keyof StatusSummary; label: string; color: string }[] = [
  { key: "new", label: "New", color: "#5b6577" },
  { key: "in_progress", label: "In progress", color: "#b07400" },
  { key: "created", label: "Created", color: "#2f6bff" },
  { key: "published", label: "Published", color: "#128a5e" },
];

export function SummaryStrip({ summary }: { summary: StatusSummary }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {ITEMS.map((it) => (
        <div
          key={it.key}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow)",
          }}
        >
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: it.color, flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {summary[it.key]}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
