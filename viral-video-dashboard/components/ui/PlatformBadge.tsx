import type { PlatformBadge as IgBadge } from "../../lib/articles";

const IG_GRADIENT = "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)";

function IgGlyph({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: "block" }}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill={color} />
    </svg>
  );
}

export function PlatformBadge({ badge }: { badge: IgBadge }) {
  const published = badge.state === "published";
  const style: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 9px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    lineHeight: 1,
    whiteSpace: "nowrap",
    ...(published
      ? {
          background: IG_GRADIENT,
          color: "#fff",
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(214,41,118,.35)",
        }
      : { background: "transparent", color: "#8a93a6", border: "1px solid #d7dce6" }),
  };
  const glyphColor = published ? "#fff" : "#8a93a6";
  const inner = (
    <>
      <IgGlyph color={glyphColor} />
      {published ? "Posted" : "IG"}
    </>
  );

  return badge.href ? (
    <a
      href={badge.href}
      target="_blank"
      rel="noopener noreferrer"
      className="vs-badge-link"
      title="View Instagram post"
      style={style}
    >
      {inner}
    </a>
  ) : (
    <span style={style}>{inner}</span>
  );
}

export function PlannedBadge({ name }: { name: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 9px",
        borderRadius: 999,
        background: "transparent",
        color: "#aab2c0",
        border: "1px dashed #d7dce6",
        whiteSpace: "nowrap",
      }}
    >
      {name} · soon
    </span>
  );
}
