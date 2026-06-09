export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSystemUserToken, getConnectionBrands } from "../../lib/connections";
import { listInstagramAccounts, type IgAccount } from "../../lib/instagram";
import { saveTokenAction, connectBrandAction, disconnectBrandAction } from "../../lib/actions";

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
    <main style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#0f1830", color: "#fff" }}>
        <span style={{ fontWeight: 700 }}>▦ Viral Studio</span>
        <Link href="/review" style={{ color: "#cdd6e6", textDecoration: "none", fontWeight: 600 }}>Review</Link>
        <Link href="/connections" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>Connections</Link>
      </header>

      <div style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        <section style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e6eaef" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Meta System User token {token ? "· set ✓" : "· not set"}</h2>
          <p style={{ color: "#667", fontSize: 14, marginTop: 4 }}>Paste your Business System User token (with instagram_content_publish + the brand assets). Stored once, used for all brands.</p>
          <form action={saveTokenAction} style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input name="token" type="password" placeholder={token ? "Replace token…" : "Paste token…"} style={{ flex: 1, padding: "9px 12px", border: "1px solid #cdd6e6", borderRadius: 8 }} />
            <button style={{ background: "#0f1830", color: "#fff", border: 0, borderRadius: 8, padding: "9px 18px", fontWeight: 700, cursor: "pointer" }}>Save</button>
          </form>
          {accountsError ? <p style={{ color: "#e5484d", fontSize: 13, marginTop: 8 }}>Could not list accounts: {accountsError}</p> : null}
        </section>

        <section style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e6eaef" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Brands</h2>
          {!token ? <p style={{ color: "#667" }}>Save a token first to map brands.</p> : brands.map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #eef1f5" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: 13, color: b.igEnabled ? "#1eb980" : "#889" }}>{b.igEnabled && b.igUsername ? `Connected as @${b.igUsername}` : "Not connected"}</div>
              </div>
              {b.igEnabled ? (
                <form action={disconnectBrandAction}><input type="hidden" name="brandId" value={b.id} /><button style={{ background: "#eef1f5", color: "#445", border: 0, borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Disconnect</button></form>
              ) : (
                <form action={connectBrandAction} style={{ display: "flex", gap: 8 }}>
                  <input type="hidden" name="brandId" value={b.id} />
                  <select name="account" style={{ padding: "8px 10px", border: "1px solid #cdd6e6", borderRadius: 8 }}>
                    {accounts.map((a) => <option key={a.igUserId} value={`${a.igUserId}|${a.username}`}>@{a.username} ({a.pageName})</option>)}
                  </select>
                  <button style={{ background: "#1eb980", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Connect</button>
                </form>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
