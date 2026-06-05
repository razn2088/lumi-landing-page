export function computeBackoffMs(attempts: number): number {
  const base = 60_000;
  const ms = base * Math.pow(2, Math.max(0, attempts - 1));
  return Math.min(ms, 30 * 60_000);
}

export type NextState = { status: "queued"; runAfterMs: number } | { status: "dead" };

export function decideFailState(attempts: number, maxAttempts: number): NextState {
  if (attempts >= maxAttempts) return { status: "dead" };
  return { status: "queued", runAfterMs: computeBackoffMs(attempts) };
}
