"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/articles", label: "Articles", icon: "▦" },
  { href: "/review", label: "Review", icon: "▶" },
  { href: "/connections", label: "Connections", icon: "⚯" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav
      style={{
        width: 232,
        flexShrink: 0,
        minHeight: "100vh",
        background: "linear-gradient(180deg,var(--sidebar),var(--sidebar-2))",
        color: "#fff",
        padding: "22px 14px",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderRight: "1px solid rgba(255,255,255,.05)",
      }}
    >
      {/* Brand lockup */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 8px 8px" }}>
        <span
          aria-hidden
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            color: "#06281d",
            background: "linear-gradient(135deg,var(--highlight),var(--accent))",
            boxShadow: "0 6px 16px rgba(30,185,128,.35), inset 0 1px 0 rgba(255,255,255,.4)",
          }}
        >
          ▦
        </span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Viral Studio</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#7e89a6" }}>
            Content Engine
          </span>
        </span>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "#5e6886",
          padding: "10px 12px 4px",
        }}
      >
        Workspace
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((n) => {
          const active = path?.startsWith(n.href) ?? false;
          return (
            <Link
              key={n.href}
              href={n.href}
              className="vs-nav-link"
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 12px",
                borderRadius: 11,
                textDecoration: "none",
                color: active ? "#fff" : "#aeb7cc",
                background: active ? "rgba(255,255,255,.10)" : "transparent",
                borderLeft: active ? "3px solid var(--highlight)" : "3px solid transparent",
                boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,.05)" : "none",
                fontWeight: active ? 700 : 600,
                fontSize: 14,
              }}
            >
              <span
                className="vs-nav-icon"
                aria-hidden
                style={{
                  width: 20,
                  textAlign: "center",
                  fontSize: 13,
                  color: active ? "var(--highlight)" : "inherit",
                }}
              >
                {n.icon}
              </span>
              {n.label}
            </Link>
          );
        })}
      </div>

      {/* Footer status */}
      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 12px",
            borderRadius: 11,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--accent)",
              boxShadow: "0 0 0 3px rgba(30,185,128,.18)",
            }}
          />
          <span style={{ fontSize: 12, color: "#9aa3bd", fontWeight: 600 }}>Pipeline live</span>
        </div>
      </div>
    </nav>
  );
}
