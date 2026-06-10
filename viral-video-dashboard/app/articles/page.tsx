import Link from "next/link";
import { getArticles, type ArticleStatus } from "../../lib/articles";
import { createVideosAction } from "../../lib/actions";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string }[] = [
  { key: "new", label: "New" }, { key: "in_progress", label: "In progress" }, { key: "created", label: "Created" }, { key: "all", label: "All" },
];
const CHIP: Record<ArticleStatus, { bg: string; fg: string; label: string }> = {
  new: { bg: "#eef1f5", fg: "#556", label: "New" }, in_progress: { bg: "#fff7d6", fg: "#8a6d00", label: "In progress" }, created: { bg: "#dff5ec", fg: "#1eb980", label: "Created" }, published: { bg: "#d7f3e7", fg: "#128a5e", label: "Published" },
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ filter?: string; brand?: string }> }) {
  const sp = await searchParams;
  const filter = sp.filter ?? "new";
  if (!sp.brand) return <div style={{ padding: 24, color: "#889" }}>Select a website to view its articles.</div>;
  const all = await getArticles(sp.brand);
  const articles = filter === "all" ? all : all.filter((a) => a.status === filter);

  return (
    <main style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#0f1830", color: "#fff" }}>
        <span style={{ fontWeight: 700 }}>▦ Viral Studio</span>
        <Link href="/articles" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>Articles</Link>
        <Link href="/review" style={{ color: "#cdd6e6", textDecoration: "none", fontWeight: 600 }}>Review</Link>
        <Link href="/connections" style={{ color: "#cdd6e6", textDecoration: "none", fontWeight: 600 }}>Connections</Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {TABS.map((t) => <Link key={t.key} href={`/articles?filter=${t.key}`} style={{ padding: "5px 12px", borderRadius: 16, fontWeight: 700, fontSize: 13, textDecoration: "none", background: t.key === filter ? "#ffd60a" : "rgba(255,255,255,.14)", color: t.key === filter ? "#111" : "#fff" }}>{t.label}</Link>)}
        </span>
      </header>

      <form action={createVideosAction}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <div style={{ color: "#667", fontSize: 14 }}>{articles.length} article(s)</div>
          <button style={{ background: "#1eb980", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Create videos</button>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          {articles.length === 0 ? <div style={{ padding: 24, color: "#889" }}>No {filter} articles.</div> : articles.map((a) => (
            <label key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px", background: "#fff", borderBottom: "1px solid #eef1f5", cursor: a.status === "new" ? "pointer" : "default" }}>
              <input type="checkbox" name="articleId" value={a.id} disabled={a.status !== "new"} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                <span style={{ fontSize: 12, color: "#778" }}>{a.brandId} · {new Date(a.publishedAt).toLocaleDateString()}</span>
              </span>
              <span style={{ background: CHIP[a.status].bg, color: CHIP[a.status].fg, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>{CHIP[a.status].label}</span>
            </label>
          ))}
        </div>
      </form>
    </main>
  );
}
