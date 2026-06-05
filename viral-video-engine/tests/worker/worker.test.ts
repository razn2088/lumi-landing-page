import { describe, it, expect } from "vitest";
import { tick } from "../../src/worker/worker.js";
import { MemoryJobsRepo } from "../../src/db/memoryRepos.js";

describe("worker tick", () => {
  it("returns false when there is no claimable job", async () => {
    const jobs = new MemoryJobsRepo();
    const ran = await tick({ jobs, workerId: "w1", handlers: { scan: async () => {} } });
    expect(ran).toBe(false);
  });

  it("runs the matching handler and completes the job", async () => {
    const jobs = new MemoryJobsRepo();
    const enq = await jobs.enqueue({ type: "scan", idempotencyKey: "k1", payload: { brandId: "topdealsus" } });
    let seen: unknown = null;
    const ran = await tick({
      jobs, workerId: "w1",
      handlers: { scan: async (payload) => { seen = payload.brandId; } },
    });
    expect(ran).toBe(true);
    expect(seen).toBe("topdealsus");
    expect(jobs.peek(enq!.id)?.status).toBe("done");
  });

  it("fails the job when the handler throws", async () => {
    const jobs = new MemoryJobsRepo();
    const enq = await jobs.enqueue({ type: "scan", idempotencyKey: "k1" });
    await tick({ jobs, workerId: "w1", handlers: { scan: async () => { throw new Error("boom"); } } });
    const job = jobs.peek(enq!.id)!;
    expect(job.status).toBe("queued"); // re-queued (attempts 1 < max 5)
    expect(job.lastError).toBe("boom");
  });

  it("only claims job types it has handlers for", async () => {
    const jobs = new MemoryJobsRepo();
    await jobs.enqueue({ type: "generate", idempotencyKey: "k1" });
    const ran = await tick({ jobs, workerId: "w1", handlers: { scan: async () => {} } });
    expect(ran).toBe(false); // generate has no handler, so it is never claimed
  });
});
