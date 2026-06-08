import { describe, it, expect, vi, afterEach } from "vitest";
import { InstagramPublisher } from "../../src/providers/publisher/instagram.js";

afterEach(() => vi.restoreAllMocks());

function jsonRes(body: unknown) {
  return { ok: true, json: async () => body, text: async () => JSON.stringify(body) } as any;
}

describe("InstagramPublisher", () => {
  it("creates a container, polls until FINISHED, publishes, and returns media id + permalink", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: any) => {
      urls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.includes("/media_publish")) return jsonRes({ id: "MEDIA1" });
      if (url.includes("/media") && (init?.method === "POST")) return jsonRes({ id: "CONTAINER1" });
      if (url.includes("CONTAINER1")) return jsonRes({ status_code: "FINISHED" });
      if (url.includes("MEDIA1")) return jsonRes({ permalink: "https://instagram.com/reel/abc" });
      return jsonRes({});
    }));

    const pub = new InstagramPublisher({ pollIntervalMs: 0, maxPolls: 5 });
    const res = await pub.publish({ videoUrl: "https://v/x.mp4", caption: "hi", igUserId: "IGUSER", accessToken: "TOK" });

    expect(res).toEqual({ mediaId: "MEDIA1", permalink: "https://instagram.com/reel/abc" });
    expect(urls.some((u) => u.startsWith("POST") && u.includes("/IGUSER/media?"))).toBe(true);
    expect(urls.some((u) => u.includes("/IGUSER/media_publish?"))).toBe(true);
  });

  it("throws if the container reports ERROR", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: any) => {
      if (url.includes("/media") && init?.method === "POST") return jsonRes({ id: "C2" });
      if (url.includes("C2")) return jsonRes({ status_code: "ERROR" });
      return jsonRes({});
    }));
    const pub = new InstagramPublisher({ pollIntervalMs: 0, maxPolls: 5 });
    await expect(pub.publish({ videoUrl: "https://v/x.mp4", caption: "hi", igUserId: "IGUSER", accessToken: "TOK" }))
      .rejects.toThrow(/ERROR/);
  });
});
