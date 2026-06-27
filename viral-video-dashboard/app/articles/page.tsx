import { getArticles, summarize, type ArticleStatus } from "../../lib/articles";
import { getActiveBrands, resolveSelectedBrand } from "../../lib/brands";
import { createVideosAction, publishNowAction } from "../../lib/actions";
import Link from "next/link";
import { VideoPreview } from "../../components/ui/VideoPreview";
import { Chip } from "../../components/ui/Chip";
import { PlatformBadge, PlannedBadge } from "../../components/ui/PlatformBadge";
import { WebsiteSelector } from "../../components/ui/WebsiteSelector";
import { SummaryStrip } from "../../components/ui/SummaryStrip";
import { Button } from "../../components/ui/Button";

export const dynamic = "force-dynamic";

const PLANNED = ["TikTok", "YouTube"];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; brand?: string; publishNow?: string }>;
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
        <SummaryStrip summary={summary} brandId={selected.id} filter={filter} />
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
          {selectableCount > 0 && <Button type="submit">Create videos</Button>}
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
              const canPublish = a.postStatus === "rendered" || a.postStatus === "rejected";
              const confirming = a.postId != null && sp.publishNow === a.postId;
              return (
                <div
                  key={a.id}
                  className="vs-row"
                  data-selectable={selectable ? "true" : undefined}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    padding: "13px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      flex: 1,
                      minWidth: 0,
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
                        style={{ display: "block", fontWeight: 700, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {a.title}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {new Date(a.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </span>
                  </label>

                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {a.videoUrl && <VideoPreview videoUrl={a.videoUrl} title={a.title} />}
                    {hasVideo && a.postId && (
                      confirming ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            name="postId"
                            value={a.postId}
                            formAction={publishNowAction}
                            className="vs-btn"
                            style={{ background: "var(--accent)", color: "#fff", border: 0, borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                          >
                            Confirm publish
                          </button>
                          <Link href={`/articles?brand=${selected.id}&filter=${filter}`} style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textDecoration: "none" }}>
                            Cancel
                          </Link>
                        </span>
                      ) : canPublish ? (
                        <Link
                          href={`/articles?brand=${selected.id}&filter=${filter}&publishNow=${a.postId}`}
                          className="vs-btn"
                          style={{ background: "var(--surface)", color: "var(--accent-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 12, textDecoration: "none" }}
                        >
                          Publish now
                        </Link>
                      ) : a.postStatus === "approved" ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>Queued</span>
                      ) : null
                    )}
                    {a.instagram && <PlatformBadge badge={a.instagram} />}
                    {hasVideo && PLANNED.map((p) => <PlannedBadge key={p} name={p} />)}
                    <Chip tone={a.status} />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </form>
    </div>
  );
}
