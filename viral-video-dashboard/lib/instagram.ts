import "server-only";

export interface IgAccount { igUserId: string; username: string; pageName: string }

const GRAPH = "https://graph.facebook.com/v21.0";

/** Lists the Instagram business accounts the System User token can reach (one per linked Page). */
export async function listInstagramAccounts(token: string): Promise<IgAccount[]> {
  const res = await fetch(`${GRAPH}/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error(`Graph API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: Array<{ name?: string; instagram_business_account?: { id?: string; username?: string } }> };
  return (json.data ?? [])
    .filter((p) => p.instagram_business_account?.id)
    .map((p) => ({ igUserId: p.instagram_business_account!.id!, username: p.instagram_business_account!.username ?? "", pageName: p.name ?? "" }));
}

/** Validates a token by calling /me; returns true if the token works. */
export async function validateToken(token: string): Promise<boolean> {
  const res = await fetch(`${GRAPH}/me?access_token=${encodeURIComponent(token)}`);
  return res.ok;
}
