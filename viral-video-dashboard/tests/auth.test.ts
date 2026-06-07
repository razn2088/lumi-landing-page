import { describe, it, expect } from "vitest";
import { isAllowedEmail } from "../lib/auth.js";

describe("isAllowedEmail", () => {
  it("matches case-insensitively and trims the allowlist", () => {
    const allow = "You@Example.com, teammate@example.com ";
    expect(isAllowedEmail("you@example.com", allow)).toBe(true);
    expect(isAllowedEmail("TEAMMATE@EXAMPLE.COM", allow)).toBe(true);
  });
  it("rejects non-listed or empty emails", () => {
    expect(isAllowedEmail("stranger@example.com", "you@example.com")).toBe(false);
    expect(isAllowedEmail(undefined, "you@example.com")).toBe(false);
    expect(isAllowedEmail("you@example.com", "")).toBe(false);
  });
});
