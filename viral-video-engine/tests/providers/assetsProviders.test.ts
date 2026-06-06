import { describe, it, expect } from "vitest";
import { FakeTTSProvider } from "../../src/providers/tts/fake.js";
import { FakeStockProvider } from "../../src/providers/stock/fake.js";

describe("fake asset providers", () => {
  it("FakeTTSProvider returns audio bytes + duration", async () => {
    const tts = new FakeTTSProvider();
    const r = await tts.synthesize({ text: "hello world", voiceId: "v1" });
    expect(r.audio.byteLength).toBeGreaterThan(0);
    expect(r.durationMs).toBeGreaterThan(0);
    expect(r.ext).toBe("wav");
  });
  it("FakeStockProvider returns a clip url for keywords, null when empty", async () => {
    const stock = new FakeStockProvider({ dehumidifier: "https://stock/x.mp4" });
    expect(await stock.searchClip(["dehumidifier"])).toBe("https://stock/x.mp4");
    expect(await stock.searchClip(["nothing-here"])).toBeNull();
  });
});
