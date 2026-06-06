import { describe, it, expect } from "vitest";
import { ProviderRegistry } from "../../src/providers/registry.js";

describe("ProviderRegistry", () => {
  it("registers and retrieves by capability + key", () => {
    const reg = new ProviderRegistry();
    reg.register("llm", "claude", { key: "claude" });
    expect(reg.has("llm", "claude")).toBe(true);
    expect(reg.get<{ key: string }>("llm", "claude").key).toBe("claude");
  });

  it("throws for an unregistered provider", () => {
    const reg = new ProviderRegistry();
    expect(() => reg.get("llm", "nope")).toThrow(/no provider/i);
  });
});
