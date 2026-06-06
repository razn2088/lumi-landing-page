import { describe, it, expect } from "vitest";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakeLLMProvider, FailingLLMProvider } from "../../src/providers/llm/fake.js";
import type { LLMProvider } from "../../src/providers/types.js";

function routerWith(...providers: LLMProvider[]) {
  const reg = new ProviderRegistry();
  for (const p of providers) reg.register("llm", p.key, p);
  return { reg, router: new ProviderRouter(reg) };
}

describe("ProviderRouter", () => {
  it("calls the primary provider", async () => {
    const { router } = routerWith(new FakeLLMProvider('{"ok":true}', "primary"));
    const r = await router.call<LLMProvider, { text: string }>(
      { capability: "llm", chain: ["primary"] },
      (p) => p.generate({ system: "s", prompt: "u" }),
    );
    expect(r.text).toBe('{"ok":true}');
  });

  it("falls back to the next provider when the first throws", async () => {
    const { router } = routerWith(new FailingLLMProvider("primary"), new FakeLLMProvider("fallback-text", "backup"));
    const r = await router.call<LLMProvider, { text: string }>(
      { capability: "llm", chain: ["primary", "backup"] },
      (p) => p.generate({ system: "s", prompt: "u" }),
    );
    expect(r.text).toBe("fallback-text");
  });

  it("throws when all providers fail", async () => {
    const { router } = routerWith(new FailingLLMProvider("a"), new FailingLLMProvider("b"));
    await expect(
      router.call<LLMProvider, { text: string }>(
        { capability: "llm", chain: ["a", "b"] },
        (p) => p.generate({ system: "s", prompt: "u" }),
      ),
    ).rejects.toThrow(/all providers failed/i);
  });

  it("throws on an empty chain", async () => {
    const { router } = routerWith(new FakeLLMProvider("x", "a"));
    await expect(
      router.call<LLMProvider, { text: string }>({ capability: "llm", chain: [] }, (p) => p.generate({ system: "s", prompt: "u" })),
    ).rejects.toThrow(/empty provider chain/i);
  });
});
