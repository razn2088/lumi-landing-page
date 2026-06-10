import { createDataClient } from "../../lib/supabase/data";
import { listPosts, getBrands } from "../../lib/posts";
import type { PostStatus } from "../../lib/types";
import { StatusTabs } from "../../components/StatusTabs";
import { BrandFilter } from "../../components/BrandFilter";
import { PostList } from "../../components/PostList";
import { ReviewPanel } from "../../components/ReviewPanel";
import { Card } from "../../components/ui/Card";

const VALID: PostStatus[] = ["rendered", "approved", "rejected"];

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ status?: string; brand?: string; sel?: string }> }) {
  const sp = await searchParams;
  const status: PostStatus = VALID.includes(sp.status as PostStatus) ? (sp.status as PostStatus) : "rendered";
  const brandId = sp.brand;
  const sb = createDataClient();
  const [posts, brands] = await Promise.all([listPosts(sb, status, brandId), getBrands(sb)]);
  const selected = posts.find((p) => p.id === sp.sel) ?? posts[0] ?? null;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1160, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Review</h1>
        <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
          {posts.length} {posts.length === 1 ? "video" : "videos"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: "var(--radius)",
          background: "linear-gradient(180deg,var(--sidebar),var(--sidebar-2))",
          boxShadow: "var(--shadow)",
        }}
      >
        <StatusTabs status={status} brandId={brandId} />
        <BrandFilter brands={brands} status={status} brandId={brandId} />
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", minHeight: 460 }}>
          <aside style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface-2)", overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
            <PostList posts={posts} status={status} brandId={brandId} selectedId={selected?.id} />
          </aside>
          <section style={{ flex: 1, minWidth: 0, overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
            <ReviewPanel post={selected} />
          </section>
        </div>
      </Card>
    </div>
  );
}
