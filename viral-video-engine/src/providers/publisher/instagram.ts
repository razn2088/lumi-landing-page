import type { Publisher, PublishRequest, PublishResult } from "../types.js";

const GRAPH = "https://graph.facebook.com/v21.0";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface InstagramPublisherOptions {
  pollIntervalMs?: number;
  maxPolls?: number;
}

export class InstagramPublisher implements Publisher {
  readonly key = "instagram";
  private pollIntervalMs: number;
  private maxPolls: number;
  constructor(opts: InstagramPublisherOptions = {}) {
    this.pollIntervalMs = opts.pollIntervalMs ?? 3000;
    this.maxPolls = opts.maxPolls ?? 30;
  }

  async publish(req: PublishRequest): Promise<PublishResult> {
    const token = req.accessToken;

    // 1. Create the REELS container.
    const createParams = new URLSearchParams({
      media_type: "REELS",
      video_url: req.videoUrl,
      caption: req.caption,
      access_token: token,
    });
    const createRes = await fetch(`${GRAPH}/${req.igUserId}/media?${createParams.toString()}`, { method: "POST" });
    if (!createRes.ok) throw new Error(`IG create container failed: ${createRes.status} ${await createRes.text()}`);
    const creationId = ((await createRes.json()) as { id?: string }).id;
    if (!creationId) throw new Error("IG create container returned no id");

    // 2. Poll until the container is FINISHED.
    let finished = false;
    for (let i = 0; i < this.maxPolls; i++) {
      const statusRes = await fetch(`${GRAPH}/${creationId}?fields=status_code&access_token=${encodeURIComponent(token)}`);
      if (!statusRes.ok) throw new Error(`IG status check failed: ${statusRes.status} ${await statusRes.text()}`);
      const status = ((await statusRes.json()) as { status_code?: string }).status_code;
      if (status === "FINISHED") { finished = true; break; }
      if (status === "ERROR" || status === "EXPIRED") throw new Error(`IG container ${status}`);
      await sleep(this.pollIntervalMs);
    }
    if (!finished) throw new Error("IG container did not finish in time");

    // 3. Publish the container.
    const publishParams = new URLSearchParams({ creation_id: creationId, access_token: token });
    const publishRes = await fetch(`${GRAPH}/${req.igUserId}/media_publish?${publishParams.toString()}`, { method: "POST" });
    if (!publishRes.ok) throw new Error(`IG publish failed: ${publishRes.status} ${await publishRes.text()}`);
    const mediaId = ((await publishRes.json()) as { id?: string }).id;
    if (!mediaId) throw new Error("IG publish returned no media id");

    // 4. Fetch the permalink (best-effort).
    let permalink = "";
    const linkRes = await fetch(`${GRAPH}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`);
    if (linkRes.ok) permalink = ((await linkRes.json()) as { permalink?: string }).permalink ?? "";

    return { mediaId, permalink };
  }
}
