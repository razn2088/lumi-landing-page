import { describe, it, expect, vi, afterEach } from "vitest";
import { PexelsStockProvider } from "../../src/providers/stock/pexels.js";

afterEach(() => vi.restoreAllMocks());

const body = {
  videos: [{ video_files: [
    { link: "https://pexels/landscape.mp4", width: 1920, height: 1080 },
    { link: "https://pexels/portrait.mp4", width: 1080, height: 1920 },
  ] }],
};

describe("PexelsStockProvider", () => {
  it("searches portrait videos and returns a portrait clip link", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
    const r = await new PexelsStockProvider("KEY").searchClip(["dehumidifier", "humid"]);
    expect(r).toBe("https://pexels/portrait.mp4");
    const url = spy.mock.calls[0]![0] as string;
    expect(url).toContain("api.pexels.com/videos/search");
    expect(url).toContain("orientation=portrait");
    expect(url).toContain("dehumidifier");
  });

  it("returns null when there are no videos", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ videos: [] }), { status: 200 }));
    expect(await new PexelsStockProvider("KEY").searchClip(["nothing"])).toBeNull();
  });
});
