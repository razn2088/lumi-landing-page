import "server-only";
import { createDataClient } from "./supabase/data";

export type ArticleStatus = "new" | "in_progress" | "created" | "published";
export interface PlatformBadge { platform: "instagram"; state: "published" | "not_posted"; href: string | null }
export interface ArticleRow {
  id: string; title: string; brandId: string; publishedAt: string;
  status: ArticleStatus; postStatus: string | null; instagram: PlatformBadge | null;
}
export interface StatusSummary { new: number; in_progress: number; created: number; published: number }

type EmbeddedPost = { video_url?: string | null; status?: string | null; ig_permalink?: string | null };

function embeddedPost(rawPosts: unknown): EmbeddedPost | null {
  return Array.isArray(rawPosts) ? (rawPosts[0] ?? null) : ((rawPosts as EmbeddedPost | null | undefined) ?? null);
}

export function deriveArticleStatus(post: EmbeddedPost | null): ArticleStatus {
  if (!post) return "new";
  if (!post.video_url) return "in_progress";
  if (post.status === "published") return "published";
  return "created";
}

export function instagramBadge(post: EmbeddedPost | null): PlatformBadge | null {
  if (!post || !post.video_url) return null;
  if (post.status === "published" && post.ig_permalink) return { platform: "instagram", state: "published", href: post.ig_permalink };
  return { platform: "instagram", state: "not_posted", href: null };
}

export function rowToArticle(r: Record<string, unknown>): ArticleRow {
  const post = embeddedPost(r.posts);
  return {
    id: r.id as string, title: r.title as string, brandId: r.brand_id as string,
    publishedAt: r.published_at as string, status: deriveArticleStatus(post),
    postStatus: post?.status ?? null, instagram: instagramBadge(post),
  };
}

export function summarize(articles: ArticleRow[]): StatusSummary {
  const s: StatusSummary = { new: 0, in_progress: 0, created: 0, published: 0 };
  for (const a of articles) s[a.status] += 1;
  return s;
}

export async function getArticles(brandId: string): Promise<ArticleRow[]> {
  const sb = createDataClient();
  const { data, error } = await sb.from("articles")
    .select("id,title,brand_id,published_at,posts(video_url,status,ig_permalink)")
    .eq("brand_id", brandId)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToArticle);
}
