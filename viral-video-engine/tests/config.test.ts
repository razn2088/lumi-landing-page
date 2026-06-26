import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("parses a valid environment", () => {
    const cfg = loadConfig({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "key",
      WORKER_ID: "w1",
    });
    expect(cfg.SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(cfg.WORKER_ID).toBe("w1");
  });

  it("defaults WORKER_ID", () => {
    const cfg = loadConfig({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "key",
    });
    expect(cfg.WORKER_ID).toBe("worker-local");
  });

  it("throws when SUPABASE_URL is missing", () => {
    expect(() => loadConfig({ SUPABASE_SERVICE_ROLE_KEY: "key" })).toThrow();
  });

  it("defaults ANTHROPIC_MODEL and leaves ANTHROPIC_API_KEY optional", () => {
    const cfg = loadConfig({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "key",
    });
    expect(cfg.ANTHROPIC_MODEL).toContain("claude");
    expect(cfg.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("defaults STORAGE_BUCKET and leaves TTS/Pexels keys optional", () => {
    const cfg = loadConfig({ SUPABASE_URL: "http://127.0.0.1:54321", SUPABASE_SERVICE_ROLE_KEY: "key" });
    expect(cfg.STORAGE_BUCKET).toBe("viral-video-assets");
    expect(cfg.GOOGLE_TTS_API_KEY).toBeUndefined();
    expect(cfg.PEXELS_API_KEY).toBeUndefined();
  });

  it("accepts GOOGLE_SERVICE_ACCOUNT_JSON and defaults it to undefined", () => {
    const base = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" };
    expect(loadConfig({ ...base }).GOOGLE_SERVICE_ACCOUNT_JSON).toBeUndefined();
    expect(loadConfig({ ...base, GOOGLE_SERVICE_ACCOUNT_JSON: "/path/sa.json" }).GOOGLE_SERVICE_ACCOUNT_JSON).toBe("/path/sa.json");
  });
});

const base = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" };

describe("loadConfig ElevenLabs", () => {
  it("defaults the voice + model and reads the key", () => {
    const cfg = loadConfig({ ...base, ELEVENLABS_API_KEY: "sk_test" });
    expect(cfg.ELEVENLABS_API_KEY).toBe("sk_test");
    expect(cfg.ELEVENLABS_VOICE_ID).toBe("XrExE9yKIg1WjnnlVkGX");
    expect(cfg.ELEVENLABS_MODEL).toBe("eleven_multilingual_v2");
  });
});
