type Variant = "primary" | "ghost" | "danger";

const V: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(180deg,var(--accent),var(--accent-2))",
    color: "#fff",
    border: 0,
    boxShadow: "0 2px 10px rgba(30,185,128,.28), inset 0 1px 0 rgba(255,255,255,.18)",
  },
  ghost: { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
  danger: {
    background: "var(--danger)",
    color: "#fff",
    border: 0,
    boxShadow: "0 2px 10px rgba(229,72,77,.26), inset 0 1px 0 rgba(255,255,255,.18)",
  },
};

export function Button({
  variant = "primary",
  children,
  className,
  ...rest
}: { variant?: Variant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={className ? `vs-btn ${className}` : "vs-btn"}
      style={{
        ...V[variant],
        borderRadius: 10,
        padding: "9px 18px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 13,
        ...(rest.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}
