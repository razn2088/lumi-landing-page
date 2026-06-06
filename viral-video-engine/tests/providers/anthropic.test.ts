import { describe, it, expect, vi } from "vitest";
import { AnthropicLLMProvider } from "../../src/providers/llm/anthropic.js";
import type Anthropic from "@anthropic-ai/sdk";

function fakeClient(create: any): Anthropic {
  return { messages: { create } } as unknown as Anthropic;
}

describe("AnthropicLLMProvider", () => {
  it("sends a cached system block + user prompt and returns concatenated text", async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: "text", text: "hello " }, { type: "text", text: "world" }] });
    const p = new AnthropicLLMProvider(fakeClient(create), "claude-test");
    const r = await p.generate({ system: "SYS", prompt: "USER" });
    expect(r.text).toBe("hello world");
    const args = create.mock.calls[0]![0];
    expect(args.model).toBe("claude-test");
    expect(args.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(args.system[0].text).toBe("SYS");
    expect(args.messages[0]).toEqual({ role: "user", content: "USER" });
  });

  it("throws when the response has no text blocks", async () => {
    const create = vi.fn().mockResolvedValue({ content: [] });
    const p = new AnthropicLLMProvider(fakeClient(create), "claude-test");
    await expect(p.generate({ system: "s", prompt: "u" })).rejects.toThrow(/no text/i);
  });
});
