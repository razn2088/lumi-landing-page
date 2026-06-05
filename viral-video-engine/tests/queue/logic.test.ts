import { describe, it, expect } from "vitest";
import { computeBackoffMs, decideFailState } from "../../src/queue/logic.js";

describe("queue logic", () => {
  it("backoff grows exponentially from 1 minute", () => {
    expect(computeBackoffMs(1)).toBe(60_000);
    expect(computeBackoffMs(2)).toBe(120_000);
    expect(computeBackoffMs(3)).toBe(240_000);
  });

  it("backoff caps at 30 minutes", () => {
    expect(computeBackoffMs(20)).toBe(30 * 60_000);
  });

  it("re-queues with backoff below max attempts", () => {
    expect(decideFailState(2, 5)).toEqual({ status: "queued", runAfterMs: 120_000 });
  });

  it("dead-letters at or above max attempts", () => {
    expect(decideFailState(5, 5)).toEqual({ status: "dead" });
  });
});
