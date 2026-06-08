import type { Publisher, PublishRequest, PublishResult } from "../types.js";

export class FakePublisher implements Publisher {
  readonly key = "fake";
  calls: PublishRequest[] = [];
  async publish(req: PublishRequest): Promise<PublishResult> {
    this.calls.push(req);
    const mediaId = `fake-media-${req.igUserId}`;
    return { mediaId, permalink: `https://instagram.com/reel/${mediaId}` };
  }
}
