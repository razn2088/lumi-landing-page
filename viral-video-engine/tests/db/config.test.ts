import { describe, it, expect } from "vitest";
import { MemoryConfigRepo } from "../../src/db/memoryRepos.js";

describe("MemoryConfigRepo", () => {
  it("returns null for a missing key and the value once set", async () => {
    const c = new MemoryConfigRepo();
    expect(await c.get("ig_system_user_token")).toBeNull();
    c.seed("ig_system_user_token", "TOKEN");
    expect(await c.get("ig_system_user_token")).toBe("TOKEN");
  });
});
