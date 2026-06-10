import Link from "next/link";
import { getArticles, summarize, type ArticleStatus } from "../../lib/articles";
import { getActiveBrands, resolveSelectedBrand } from "../../lib/brands";
import { createVideosAction } from "../../lib/actions";
import { Chip } from "../../components/ui/Chip";
import { PlatformBadge, PlannedBadge } from "../../components/ui/PlatformBadge";
import { WebsiteSelector } from "../../components/ui/WebsiteSelector";
import { SummaryStrip } from "../../components/ui/SummaryStrip";
import { Button } from "../../components/ui/Button";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string }[] = [
  { key: "new", label: "New" },
  { key: "in_progress", label: "In progress" },
  { key: "created", label: "Created" },
  { key: "published", label: "Published" },
  { key: "all", label: "All" },
];
const PLANNED = ["TikTok", "YouTube"];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; brand?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "new";
  const brands = await getActiveBrands();
  const selected = resolveSelectedBrand(brands, sp.brand);

  if (!selected) {
    return (
      <div style={{ padding: "24px 28px", maxWidth: 1040, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px" }}>Articles</h1>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 10, opacity: 0.5 }} aria-hidden>
            ▦
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>No active websites yet</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Activate a website in Connections to start turning its articles into videos.
          </div>
        </div>
      </div>
    );
  }

  const all = await getArticles(selected.id);
  const summary = summarize(all);
  const articles = filter === "all" ? all : all.filter((a) => a.status === (filter as ArticleStatus));
  const selectableCount = articles.reduce((n, a) => n + (a.status === "new" ? 1 : 0), 0);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1040, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 14,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Articles</h1>
        {selected.siteUrl && (
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected.siteUrl.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <WebsiteSelector brands={brands} selectedId={selected.id} filter={filter} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <SummaryStrip summary={summary} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={`/articles?brand=${selected.id}&filter=${t.key}`}
              className="vs-tab"
              data-active={active ? "true" : undefined}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                background: active ? "var(--highlight)" : "var(--surface)",
                color: active ? "#1c1600" : "var(--text)",
                border: active ? "1px solid var(--highlight)" : "1px solid var(--border)",
                boxShadow: active ? "0 2px 8px rgba(255,214,10,.35)" : "none",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <form action={createVideosAction}>
        <input type="hidden" name="brandId" value={selected.id} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
            {articles.length} {articles.length === 1 ? "article" : "articles"}
            {selectableCount > 0 && (
              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                {" "}
                · {selectableCount} ready to create
              </span>
            )}
          </div>
          <Button type="submit" disabled={selectableCount === 0} style={selectableCount === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            Create videos
          </Button>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          {articles.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No {filter === "all" ? "" : `${filter} `}articles for this website yet.
            </div>
          ) : (
            articles.map((a) => {
              const selectable = a.status === "new";
              const hasVideo = a.status === "created" || a.status === "published";
              return (
                <label
                  key={a.id}
                  className="vs-row"
                  data-selectable={selectable ? "true" : undefined}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    padding: "13px 16px",
                    borderBottom: "1px solid var(--border)",
                    cursor: selectable ? "pointer" : "default",
                  }}
                >
                  <input
                    type="checkbox"
                    className="vs-check"
                    name="articleId"
                    value={a.id}
                    disabled={!selectable}
                    aria-label={`Select ${a.title}`}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      title={a.title}
                      style={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.title}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(a.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    {a.instagram && <PlatformBadge badge={a.instagram} />}
                    {hasVideo && PLANNED.map((p) => <PlannedBadge key={p} name={p} />)}
                    <Chip tone={a.status} />
                  </span>
                </label>
              );
            })
          )}
        </div>
      </form>
    </div>
  );
}
