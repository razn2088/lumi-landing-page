import { createHash } from "node:crypto";
import type { Article, Brand } from "../types/domain.js";

export interface WpPost {
  id: number;
  date_gmt: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  _embedded?: { "wp:featuredmedia"?: Array<{ source_url?: string }> };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) urls.push(m[1]!);
  return urls;
}

export function parseArticle(brand: Brand, post: WpPost): Omit<Article, "id"> {
  const title = stripHtml(post.title.rendered);
  const rawContent = post.content?.rendered ?? "";
  const content = stripHtml(rawContent);
  const featuredImageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const contentHash = createHash("sha256").update(`${post.id}|${title}|${content}`).digest("hex");
  return {
    brandId: brand.id,
    wpPostId: post.id,
    url: post.link,
    title,
    excerpt: stripHtml(post.excerpt?.rendered ?? ""),
    content,
    imageUrls: extractImageUrls(rawContent),
    featuredImageUrl,
    contentHash,
    publishedAt: new Date(`${post.date_gmt}Z`).toISOString(),
  };
}
