export interface LLMRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
  cacheKey?: string;
}

export interface LLMResult {
  text: string;
}

export interface LLMProvider {
  readonly key: string;
  generate(req: LLMRequest): Promise<LLMResult>;
}
