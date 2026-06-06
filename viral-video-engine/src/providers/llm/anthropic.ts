import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMRequest, LLMResult } from "../types.js";

export class AnthropicLLMProvider implements LLMProvider {
  readonly key = "claude";
  constructor(private client: Anthropic, private model: string) {}

  async generate(req: LLMRequest): Promise<LLMResult> {
    const msg = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 2048,
      system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: req.prompt }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    if (!text) throw new Error("Claude returned no text content");
    return { text };
  }
}

export function createAnthropicProvider(apiKey: string, model: string): AnthropicLLMProvider {
  return new AnthropicLLMProvider(new Anthropic({ apiKey }), model);
}
