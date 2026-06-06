export class ProviderRegistry {
  private map = new Map<string, unknown>();

  register(capability: string, key: string, impl: unknown): void {
    this.map.set(`${capability}:${key}`, impl);
  }

  has(capability: string, key: string): boolean {
    return this.map.has(`${capability}:${key}`);
  }

  get<T>(capability: string, key: string): T {
    const impl = this.map.get(`${capability}:${key}`);
    if (!impl) throw new Error(`No provider registered for ${capability}:${key}`);
    return impl as T;
  }
}
