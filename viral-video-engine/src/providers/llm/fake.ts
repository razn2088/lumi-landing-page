import type { LLMProvider, LLMRequest, LLMResult } from "../types.js";

export class FakeLLMProvider implements LLMProvider {
  readonly key: string;
  constructor(private response: string, key = "fake") {
    this.key = key;
  }
  async generate(_req: LLMRequest): Promise<LLMResult> {
    return { text: this.response };
  }
}

export class FailingLLMProvider implements LLMProvider {
  readonly key: string;
  constructor(key = "failing") {
    this.key = key;
  }
  async generate(_req: LLMRequest): Promise<LLMResult> {
    throw new Error(`provider ${this.key} is down`);
  }
}
