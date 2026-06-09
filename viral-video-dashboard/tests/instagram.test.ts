import { describe, it, expect, vi, afterEach } from "vitest";
import { listInstagramAccounts } from "../lib/instagram";

afterEach(() => vi.restoreAllMocks());

describe("listInstagramAccounts", () => {
  it("maps pages with a linked IG account and drops pages without one", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [
        { name: "Top Deals Page", instagram_business_account: { id: "IG1", username: "topdealsus" } },
        { name: "No IG Page" },
      ] }),
    } as any)));
    const accounts = await listInstagramAccounts("TOKEN");
    expect(accounts).toEqual([{ igUserId: "IG1", username: "topdealsus", pageName: "Top Deals Page" }]);
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 400, text: async () => "bad token" } as any)));
    await expect(listInstagramAccounts("TOKEN")).rejects.toThrow(/400/);
  });
});
