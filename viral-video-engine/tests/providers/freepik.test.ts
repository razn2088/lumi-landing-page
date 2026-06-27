import { describe, it, expect, vi, afterEach } from "vitest";
import { FreepikStockProvider } from "../../src/providers/stock/freepik.js";

afterEach(() => vi.restoreAllMocks());

function mockFreepik() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/v1/resources/") && url.endsWith("/download")) {
      const id = url.match(/\/resources\/(\d+)\/download/)![1];
      return new Response(JSON.stringify({ data: { url: `https://cdn/x${id}.jpg` } }), { status: 200 });
    }
    if (url.includes("/v1/resources?")) {
      return new Response(
        JSON.stringify({ data: [{ id: 1, image: { type: "photo" } }, { id: 2, image: { type: "photo" } }] }),
        { status: 200 },
      );
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
}

describe("FreepikStockProvider (portrait photos)", () => {
  it("returns multiple downloadable image urls for searchClips", async () => {
    const spy = mockFreepik();
    const clips = await new FreepikStockProvider("KEY").searchClips(["bed"], 2);
    expect(clips).toEqual(["https://cdn/x1.jpg", "https://cdn/x2.jpg"]);
    const searchUrl = spy.mock.calls.map((c) => String(c[0])).find((u) => u.includes("/v1/resources?"))!;
    expect(searchUrl).toContain("term=bed");
    expect(searchUrl).toContain("photo");
    const headers = (spy.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers["x-freepik-api-key"]).toBe("KEY");
  });

  it("searchClip returns the first image", async () => {
    mockFreepik();
    expect(await new FreepikStockProvider("KEY").searchClip(["bed"])).toBe("https://cdn/x1.jpg");
  });

  it("returns [] for empty keywords without fetching", async () => {
    const spy = mockFreepik();
    expect(await new FreepikStockProvider("KEY").searchClips([], 3)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("throws when the search request is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 500 }));
    await expect(new FreepikStockProvider("KEY").searchClips(["bed"], 2)).rejects.toThrow(/Freepik image search failed: 500/);
  });
});
