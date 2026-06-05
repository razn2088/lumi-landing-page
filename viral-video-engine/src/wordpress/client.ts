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
    const params = new URLSearchParams({
      per_page: String(opts.perPage ?? 10),
      _embed: "1",
      orderby: "date",
      order: "desc",
    });
    if (opts.after) params.set("after", opts.after);
    const res = await fetch(`${brand.wpApiBase}/posts?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`WordPress fetch failed: ${res.status} for ${brand.id}`);
    }
    return (await res.json()) as WpPost[];
  }
}
