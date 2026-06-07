export function isAllowedEmail(email: string | undefined | null, allowList: string | undefined): boolean {
  if (!email || !allowList) return false;
  const allowed = allowList.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
