import type { Brand } from "../types/domain.js";
import type { WpPost } from "./parse.js";

export interface FetchOpts {
  after?: string;
  perPage?: number;
}

export interface WordPressClient {
  fetchRecentPosts(brand: Brand, opts?: FetchOpts): Promise<WpPost[]>;
}

export class HttpWordPressClient implements WordPressClient {
  async fetchRecentPosts(brand: Brand, opts: FetchOpts = {}): Promise<WpPost[]> {
    const perPage = opts.perPage ?? 100;
    const all: WpPost[] = [];
    let page = 1;
    for (;;) {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
        _embed: "1",
        orderby: "date",
        order: "desc",
      });
      if (opts.after) params.set("after", opts.after);
      const res = await fetch(`${brand.wpApiBase}/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`WordPress fetch failed: ${res.status} for ${brand.id}`);
      }
      const batch = (await res.json()) as WpPost[];
      all.push(...batch);
      const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
      if (batch.length === 0 || page >= totalPages) break;
      page += 1;
    }
    return all;
  }
}
