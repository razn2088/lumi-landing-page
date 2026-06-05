import type { Brand } from "../types/domain.js";
import type { WordPressClient, FetchOpts } from "./client.js";
import type { WpPost } from "./parse.js";

export class FakeWordPressClient implements WordPressClient {
  constructor(private posts: WpPost[]) {}
  async fetchRecentPosts(_brand: Brand, _opts: FetchOpts = {}): Promise<WpPost[]> {
    return this.posts;
  }
}
