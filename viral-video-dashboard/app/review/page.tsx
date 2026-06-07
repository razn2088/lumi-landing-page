import { createDataClient } from "../../lib/supabase/data";
import { listPosts, getBrands } from "../../lib/posts";
import type { PostStatus } from "../../lib/types";
import { StatusTabs } from "../../components/StatusTabs";
import { BrandFilter } from "../../components/BrandFilter";
import { PostList } from "../../components/PostList";
import { ReviewPanel } from "../../components/ReviewPanel";

const VALID: PostStatus[] = ["rendered", "approved", "rejected"];

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ status?: string; brand?: string; sel?: string }> }) {
  const sp = await searchParams;
  const status: PostStatus = VALID.includes(sp.status as PostStatus) ? (sp.status as PostStatus) : "rendered";
  const brandId = sp.brand;
  const sb = createDataClient();
  const [posts, brands] = await Promise.all([listPosts(sb, status, brandId), getBrands(sb)]);
  const selected = posts.find((p) => p.id === sp.sel) ?? posts[0] ?? null;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#0f1830", color: "#fff" }}>
        <span style={{ fontWeight: 700 }}>▦ Viral Studio</span>
        <StatusTabs status={status} brandId={brandId} />
        <BrandFilter brands={brands} status={status} brandId={brandId} />
      </header>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={{ width: 320, borderRight: "1px solid #e6eaef", background: "#fff", overflowY: "auto" }}>
          <PostList posts={posts} status={status} brandId={brandId} selectedId={selected?.id} />
        </aside>
        <section style={{ flex: 1, overflowY: "auto" }}>
          <ReviewPanel post={selected} />
        </section>
      </div>
    </main>
  );
}
