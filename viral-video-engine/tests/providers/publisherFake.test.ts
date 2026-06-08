import { describe, it, expect } from "vitest";
import { FakePublisher } from "../../src/providers/publisher/fake.js";

describe("FakePublisher", () => {
  it("returns a deterministic media id + permalink and records the request", async () => {
    const pub = new FakePublisher();
    const res = await pub.publish({ videoUrl: "https://v/x.mp4", caption: "hi #a", igUserId: "123", accessToken: "tok" });
    expect(res.mediaId).toBe("fake-media-123");
    expect(res.permalink).toContain("fake-media-123");
    expect(pub.calls[0]!.caption).toBe("hi #a");
  });
});
