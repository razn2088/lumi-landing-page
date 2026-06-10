import { describe, it, expect } from "vitest";
import { sha256Hex, timingSafeEqual, gateToken, GATE_COOKIE } from "../lib/gate";

describe("sha256Hex", () => {
  it("produces the known SHA-256 of 'abc'", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("is 64 hex chars", async () => {
    expect(await sha256Hex("anything")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("timingSafeEqual", () => {
  it("true for equal strings", () => expect(timingSafeEqual("abcd", "abcd")).toBe(true));
  it("false for different same-length strings", () => expect(timingSafeEqual("abcd", "abce")).toBe(false));
  it("false for different-length strings", () => expect(timingSafeEqual("abc", "abcd")).toBe(false));
});

describe("gateToken", () => {
  it("equals sha256 of the password and matches itself", async () => {
    const t = await gateToken("s3cret");
    expect(t).toBe(await sha256Hex("s3cret"));
    expect(timingSafeEqual(t, await gateToken("s3cret"))).toBe(true);
  });
  it("differs for a wrong password", async () => {
    expect(timingSafeEqual(await gateToken("s3cret"), await gateToken("wrong"))).toBe(false);
  });
});

describe("GATE_COOKIE", () => {
  it("is a stable cookie name", () => expect(GATE_COOKIE).toBe("vs_gate"));
});
