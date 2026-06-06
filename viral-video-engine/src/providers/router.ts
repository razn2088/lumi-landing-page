import type { ProviderRegistry } from "./registry.js";

export interface RouteOptions {
  capability: string;
  chain: string[];
}

export class ProviderRouter {
  constructor(private registry: ProviderRegistry) {}

  async call<TProvider, TResult>(
    opts: RouteOptions,
    invoke: (provider: TProvider) => Promise<TResult>,
  ): Promise<TResult> {
    if (opts.chain.length === 0) throw new Error(`Empty provider chain for ${opts.capability}`);
    let lastError: unknown;
    for (const key of opts.chain) {
      try {
        const provider = this.registry.get<TProvider>(opts.capability, key);
        return await invoke(provider);
      } catch (e) {
        lastError = e;
      }
    }
    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`All providers failed for ${opts.capability} [${opts.chain.join(", ")}]: ${reason}`);
  }
}
