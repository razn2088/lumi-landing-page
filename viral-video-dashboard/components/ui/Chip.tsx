import type { ArticleStatus } from "../../lib/articles";

const TONE: Record<ArticleStatus, { bg: string; fg: string; dot: string; label: string }> = {
  new: { bg: "#eceff4", fg: "#5b6577", dot: "#8b94a6", label: "New" },
  in_progress: { bg: "#fff3d6", fg: "#b07400", dot: "#e0a526", label: "In progress" },
  created: { bg: "#e4ecff", fg: "#2f6bff", dot: "#5b8bff", label: "Created" },
  published: { bg: "#d7f3e7", fg: "#128a5e", dot: "#1eb980", label: "Published" },
};

export function Chip({ tone }: { tone: ArticleStatus }) {
  const t = TONE[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: t.bg,
        color: t.fg,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".4px",
        padding: "4px 10px 4px 8px",
        borderRadius: 999,
        boxShadow: "inset 0 0 0 1px rgba(15,24,48,.04)",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: t.dot, flexShrink: 0 }} />
      {t.label}
    </span>
  );
}
