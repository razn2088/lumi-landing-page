import { describe, it, expect, vi, afterEach } from "vitest";
import { FreepikStockProvider } from "../../src/providers/stock/freepik.js";

afterEach(() => vi.restoreAllMocks());

function mockFreepik() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/v1/videos/") && url.endsWith("/download")) {
      const id = url.match(/\/videos\/(\d+)\/download/)![1];
      return new Response(JSON.stringify({ data: { url: `https://cdn/x${id}.mp4` } }), { status: 200 });
    }
    if (url.includes("/v1/videos?")) {
      return new Response(
        JSON.stringify({ data: [{ id: 1, aspect_ratio: "9:16" }, { id: 2, aspect_ratio: "16:9" }] }),
        { status: 200 },
      );
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
}

describe("FreepikStockProvider", () => {
  it("returns multiple downloadable clip urls for searchClips", async () => {
    const spy = mockFreepik();
    const clips = await new FreepikStockProvider("KEY").searchClips(["bed"], 2);
    expect(clips).toEqual(["https://cdn/x1.mp4", "https://cdn/x2.mp4"]);
    const searchUrl = spy.mock.calls.map((c) => String(c[0])).find((u) => u.includes("/v1/videos?"))!;
    expect(searchUrl).toContain("term=bed");
    const headers = (spy.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers["x-freepik-api-key"]).toBe("KEY");
  });

  it("searchClip returns the first clip", async () => {
    mockFreepik();
    const clip = await new FreepikStockProvider("KEY").searchClip(["bed"]);
    expect(clip).toBe("https://cdn/x1.mp4");
  });

  it("returns [] for empty keywords without fetching", async () => {
    const spy = mockFreepik();
    expect(await new FreepikStockProvider("KEY").searchClips([], 3)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("throws when the search request is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 500 }));
    await expect(new FreepikStockProvider("KEY").searchClips(["bed"], 2)).rejects.toThrow(/Freepik video search failed: 500/);
  });
});
