export const dynamic = "force-dynamic";

import { getSystemUserToken, getConnectionBrands } from "../../lib/connections";
import { listInstagramAccounts, type IgAccount } from "../../lib/instagram";
import { saveTokenAction, connectBrandAction, disconnectBrandAction } from "../../lib/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default async function ConnectionsPage() {
  const token = await getSystemUserToken();
  const brands = await getConnectionBrands();
  let accounts: IgAccount[] = [];
  let accountsError = "";
  if (token) {
    try { accounts = await listInstagramAccounts(token); }
    catch (e) { accountsError = e instanceof Error ? e.message : String(e); }
  }

  return (
    <div style={{ padding: "24px 28px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px" }}>Connections</h1>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          Meta System User token
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".4px",
              padding: "3px 9px",
              borderRadius: "var(--radius-pill)",
              background: token ? "var(--accent-soft)" : "var(--surface-2)",
              color: token ? "var(--accent-2)" : "var(--text-muted)",
              border: token ? "1px solid transparent" : "1px solid var(--border)",
            }}
          >
            {token ? "Set ✓" : "Not set"}
          </span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4, marginBottom: 0, lineHeight: 1.5 }}>
          Paste your Business System User token (with instagram_content_publish + the brand assets). Stored once, used for all brands.
        </p>
        <form action={saveTokenAction} style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            name="token"
            type="password"
            placeholder={token ? "Replace token…" : "Paste token…"}
            style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14, background: "var(--surface)", color: "var(--text)" }}
          />
          <Button variant="primary" type="submit">Save</Button>
        </form>
        {accountsError ? <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10, marginBottom: 0 }}>Could not list accounts: {accountsError}</p> : null}
      </Card>

      <Card style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 17, fontWeight: 800 }}>Brands</h2>
        {!token ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Save a token first to map brands.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {brands.map((b) => (
              <Card key={b.id} style={{ background: "var(--surface-2)", boxShadow: "none", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#fff",
                    background: "linear-gradient(160deg,#243447,#3c5570)",
                  }}
                >
                  {b.name[0] ?? "?"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: b.igEnabled ? "var(--accent-2)" : "var(--text-muted)" }}>
                    {b.igEnabled && b.igUsername ? `Connected as @${b.igUsername}` : "Not connected"}
                  </div>
                </div>
                {b.igEnabled ? (
                  <form action={disconnectBrandAction}>
                    <input type="hidden" name="brandId" value={b.id} />
                    <Button variant="ghost" type="submit">Disconnect</Button>
                  </form>
                ) : (
                  <form action={connectBrandAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input type="hidden" name="brandId" value={b.id} />
                    <select name="account" style={{ padding: "9px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, background: "var(--surface)", color: "var(--text)" }}>
                      {accounts.map((a) => <option key={a.igUserId} value={`${a.igUserId}|${a.username}`}>@{a.username} ({a.pageName})</option>)}
                    </select>
                    <Button variant="primary" type="submit">Connect</Button>
                  </form>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
