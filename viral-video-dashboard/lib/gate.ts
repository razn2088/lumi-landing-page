// Shared password-gate helpers. Edge- and Node-safe (Web Crypto only — no node:crypto),
// so both the middleware (proxy.ts) and the login server action can use them.

export const GATE_COOKIE = "vs_gate";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time string compare (equal-length hex strings) to avoid timing leaks.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// The cookie token a valid session holds: sha256 of the configured password.
// Unforgeable without knowing the password; safe to store in an httpOnly cookie.
export async function gateToken(password: string): Promise<string> {
  return sha256Hex(password);
}
