import "server-only";
import { createDataClient } from "./supabase/data";

export type ArticleStatus = "new" | "in_progress" | "created";
export interface ArticleRow { id: string; title: string; brandId: string; publishedAt: string; status: ArticleStatus; postStatus: string | null }

type EmbeddedPost = { video_url?: string | null; status?: string | null };

export function deriveArticleStatus(post: EmbeddedPost | null): ArticleStatus {
  if (!post) return "new";
  if (post.video_url) return "created";
  return "in_progress";
}

export function rowToArticle(r: Record<string, unknown>): ArticleRow {
  const rawPosts = r.posts;
  const post: EmbeddedPost | null = Array.isArray(rawPosts) ? (rawPosts[0] ?? null) : ((rawPosts as EmbeddedPost | null | undefined) ?? null);
  return { id: r.id as string, title: r.title as string, brandId: r.brand_id as string, publishedAt: r.published_at as string, status: deriveArticleStatus(post), postStatus: post?.status ?? null };
}

export async function getArticles(): Promise<ArticleRow[]> {
  const sb = createDataClient();
  const { data, error } = await sb.from("articles").select("id,title,brand_id,published_at,posts(video_url,status)").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToArticle);
}
