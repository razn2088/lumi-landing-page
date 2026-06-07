import Link from "next/link";
import type { DashboardPost } from "../lib/types";
export function PostList({ posts, status, brandId, selectedId }: { posts: DashboardPost[]; status: string; brandId?: string; selectedId?: string }) {
  if (posts.length === 0) return <div style={{ padding: 16, color: "#889" }}>No {status === "rendered" ? "pending" : status} videos.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {posts.map((p) => {
        const params = new URLSearchParams({ status, ...(brandId ? { brand: brandId } : {}), sel: p.id });
        const on = p.id === selectedId;
        return (
          <Link key={p.id} href={`/review?${params.toString()}`} style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, textDecoration: "none", color: "#0f1830", background: on ? "#fff7d6" : "transparent", borderBottom: "1px solid #eef1f5" }}>
            <span style={{ width: 26, height: 46, borderRadius: 5, background: "linear-gradient(160deg,#243447,#3c5570)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flex: "none" }}>▶</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.script?.hook ?? "(no hook)"}</span>
              <span style={{ fontSize: 11, color: "#778" }}>{p.brandName}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
