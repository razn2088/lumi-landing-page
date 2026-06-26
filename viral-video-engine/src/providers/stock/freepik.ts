import type { StockProvider } from "../types.js";

interface FreepikVideo { id: number; aspect_ratio?: string }
const PORTRAIT = new Set(["9:16", "3:4", "4:5", "2:3"]);

export class FreepikStockProvider implements StockProvider {
  readonly key = "freepik";
  constructor(private apiKey: string) {}

  async searchClip(keywords: string[]): Promise<string | null> {
    const c = await this.searchClips(keywords, 1);
    return c[0] ?? null;
  }

  async searchClips(keywords: string[], count: number): Promise<string[]> {
    const term = keywords.join(" ").trim();
    if (!term) return [];
    const params = new URLSearchParams({ term, limit: String(Math.max(count * 2, count)) });
    const res = await fetch(`https://api.freepik.com/v1/videos?${params}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`Freepik video search failed: ${res.status}`);
    const json = (await res.json()) as { data?: FreepikVideo[] };
    const all = json.data ?? [];
    const portrait = all.filter((v) => v.aspect_ratio && PORTRAIT.has(v.aspect_ratio));
    // Prefer portrait, but top up with the rest (renderer cover-crops) so we reach `count`.
    const ordered = [...portrait, ...all.filter((v) => !portrait.includes(v))];
    const picked = ordered.slice(0, count);
    const urls: string[] = [];
    for (const v of picked) {
      const dl = await fetch(`https://api.freepik.com/v1/videos/${v.id}/download`, { headers: this.headers() });
      if (!dl.ok) continue;
      const dj = (await dl.json()) as { data?: { url?: string } };
      if (dj.data?.url) urls.push(dj.data.url);
    }
    return urls;
  }

  private headers() { return { "x-freepik-api-key": this.apiKey, Accept: "application/json" }; }
}
