import type { StockProvider } from "../types.js";

interface PexelsVideoFile { link: string; width: number; height: number }
interface PexelsVideo { video_files: PexelsVideoFile[] }
interface PexelsResponse { videos?: PexelsVideo[] }

export class PexelsStockProvider implements StockProvider {
  readonly key = "pexels";
  constructor(private apiKey: string) {}

  async searchClip(keywords: string[]): Promise<string | null> {
    return (await this.searchClips(keywords, 1))[0] ?? null;
  }

  async searchClips(keywords: string[], count: number): Promise<string[]> {
    const query = keywords.join(" ").trim();
    if (!query) return [];
    const params = new URLSearchParams({ query, per_page: String(Math.max(count * 2, count)), orientation: "portrait", size: "medium" });
    const res = await fetch(`https://api.pexels.com/videos/search?${params.toString()}`, { headers: { Authorization: this.apiKey } });
    if (!res.ok) throw new Error(`Pexels search failed: ${res.status}`);
    const json = (await res.json()) as PexelsResponse;
    const out: string[] = [];
    for (const v of json.videos ?? []) {
      const files = v.video_files ?? [];
      // Prefer a portrait HD file (<= 1920 tall); avoid UHD (huge, fills the render disk cache).
      const portraitFiles = files.filter((f) => f.height > f.width).sort((a, b) => a.height - b.height);
      const pick = [...portraitFiles].reverse().find((f) => f.height <= 1920) ?? portraitFiles[0] ?? files[0];
      if (pick?.link && !out.includes(pick.link)) out.push(pick.link);
      if (out.length >= count) break;
    }
    return out;
  }
}
