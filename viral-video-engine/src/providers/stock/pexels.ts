import type { StockProvider } from "../types.js";

interface PexelsVideoFile { link: string; width: number; height: number }
interface PexelsResponse { videos?: { video_files: PexelsVideoFile[] }[] }

export class PexelsStockProvider implements StockProvider {
  readonly key = "pexels";
  constructor(private apiKey: string) {}

  async searchClip(keywords: string[]): Promise<string | null> {
    const query = keywords.join(" ").trim();
    if (!query) return null;
    const params = new URLSearchParams({ query, per_page: "1", orientation: "portrait", size: "medium" });
    const res = await fetch(`https://api.pexels.com/videos/search?${params.toString()}`, {
      headers: { Authorization: this.apiKey },
    });
    if (!res.ok) throw new Error(`Pexels search failed: ${res.status}`);
    const json = (await res.json()) as PexelsResponse;
    const files = json.videos?.[0]?.video_files ?? [];
    const portrait = files.find((f) => f.height > f.width) ?? files[0];
    return portrait?.link ?? null;
  }
}
