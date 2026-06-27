import type { StockProvider } from "../types.js";

interface FreepikResource { id: number; image?: { type?: string }; type?: string }

export class FreepikStockProvider implements StockProvider {
  readonly key = "freepik";
  constructor(private apiKey: string) {}

  async searchClip(keywords: string[]): Promise<string | null> {
    const c = await this.searchClips(keywords, 1);
    return c[0] ?? null;
  }

  // Magnific stock videos are 4K-only and often horizontal (a bad fit for vertical), so we
  // source from its large portrait *photo* library instead — light, and great with Ken Burns.
  async searchClips(keywords: string[], count: number): Promise<string[]> {
    const term = keywords.join(" ").trim();
    if (!term) return [];
    const params = new URLSearchParams({
      term,
      "filters[content_type][photo]": "1",
      "filters[orientation][portrait]": "1",
      limit: String(Math.max(count * 2, count)),
    });
    const res = await fetch(`https://api.freepik.com/v1/resources?${params}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`Freepik image search failed: ${res.status}`);
    const items = ((await res.json()) as { data?: FreepikResource[] }).data ?? [];
    const photos = items.filter((it) => (it.image?.type ?? it.type) === "photo");
    const picked = (photos.length ? photos : items).slice(0, count);
    const urls: string[] = [];
    for (const it of picked) {
      const dl = await fetch(`https://api.freepik.com/v1/resources/${it.id}/download`, { headers: this.headers() });
      if (!dl.ok) continue;
      const dj = (await dl.json()) as { data?: { url?: string } };
      if (dj.data?.url) urls.push(dj.data.url);
    }
    return urls;
  }

  private headers() { return { "x-freepik-api-key": this.apiKey, Accept: "application/json" }; }
}
