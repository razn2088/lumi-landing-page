import type { StockProvider } from "../types.js";

export class FakeStockProvider implements StockProvider {
  readonly key = "fake";
  constructor(private byKeyword: Record<string, string> = {}) {}
  async searchClip(keywords: string[]): Promise<string | null> {
    for (const k of keywords) {
      if (this.byKeyword[k]) return this.byKeyword[k]!;
    }
    return null;
  }
}
