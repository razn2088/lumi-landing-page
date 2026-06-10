"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

// Auth pages render bare (no sidebar) — a logged-out visitor should not see in-app nav.
const BARE_PATHS = ["/gate", "/login"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (BARE_PATHS.some((p) => path?.startsWith(p))) return <>{children}</>;
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
