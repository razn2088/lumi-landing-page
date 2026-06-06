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

export interface TTSRequest {
  text: string;
  voiceId: string;
}
export interface TTSResult {
  audio: Uint8Array;
  durationMs: number;
  ext: "wav" | "mp3";
}
export interface TTSProvider {
  readonly key: string;
  synthesize(req: TTSRequest): Promise<TTSResult>;
}

export interface StockProvider {
  readonly key: string;
  /** Returns a portrait video clip URL for the given keywords, or null if none found. */
  searchClip(keywords: string[]): Promise<string | null>;
}
