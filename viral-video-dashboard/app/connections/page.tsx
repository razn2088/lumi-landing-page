export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSystemUserToken, getConnectionBrands, type ConnectionBrand } from "../../lib/connections";
import { listInstagramAccounts, type IgAccount } from "../../lib/instagram";
import {
  connectBrandAction, disconnectBrandAction,
  createBrandAction, deleteBrandAction, deactivateBrandAction, activateBrandAction,
} from "../../lib/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: 14, background: "var(--surface)", color: "var(--text)",
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 5, display: "block" };

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirmDelete?: string }>;
}) {
  const sp = await searchParams;
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

      {sp.error ? (
        <Card style={{ padding: "12px 16px", marginBottom: 16, border: "1px solid var(--danger)", background: "#fff5f5" }}>
          <span style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>{sp.error}</span>
        </Card>
      ) : null}

      {!token ? (
        <Card style={{ padding: "12px 16px", marginBottom: 16, background: "var(--surface-2)", boxShadow: "none" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            To link Instagram accounts, add your Meta token in{" "}
            <Link href="/settings" style={{ color: "var(--accent-2)", fontWeight: 700 }}>Settings</Link>.
          </span>
        </Card>
      ) : null}

      {/* Add brand */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 17, fontWeight: 800 }}>Add a brand</h2>
        <form action={createBrandAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle} htmlFor="b-name">Name</label>
              <input id="b-name" name="name" required placeholder="Top Deals US" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle} htmlFor="b-url">Site URL</label>
              <input id="b-url" name="siteUrl" required placeholder="https://topdealsus.com" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle} htmlFor="b-niche">Niche</label>
            <input id="b-niche" name="niche" required placeholder="Amazon deals and product listicles" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="b-tone">Tone</label>
            <textarea id="b-tone" name="tone" required rows={2}
              placeholder="High-energy, punchy deal-hunter. Short sentences. Creates urgency for US online shoppers."
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Brand color</span>
              <input type="color" name="brandColor" defaultValue="#ffd60a"
                style={{ width: 40, height: 28, padding: 0, border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)" }} />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" name="useFeaturedImageBeat" />
              Use the article&apos;s featured image as a beat
            </label>
            <div style={{ marginLeft: "auto" }}>
              <Button variant="primary" type="submit">Add brand</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Brand list */}
      <Card style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 17, fontWeight: 800 }}>Brands</h2>
        {brands.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No brands yet. Add one above.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {brands.map((b) => (
              <BrandRow
                key={b.id}
                brand={b}
                accounts={accounts}
                hasToken={Boolean(token)}
                confirmDelete={sp.confirmDelete === b.id}
              />
            ))}
          </div>
        )}
        {accountsError ? (
          <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10, marginBottom: 0 }}>Could not list Instagram accounts: {accountsError}</p>
        ) : null}
      </Card>
    </div>
  );
}

function BrandRow({
  brand: b, accounts, hasToken, confirmDelete,
}: {
  brand: ConnectionBrand; accounts: IgAccount[]; hasToken: boolean; confirmDelete: boolean;
}) {
  return (
    <Card style={{ background: "var(--surface-2)", boxShadow: "none", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: b.active ? 1 : 0.6 }}>
      <span
        aria-hidden
        style={{
          width: 36, height: 36, flexShrink: 0, borderRadius: 10,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color: "#fff",
          background: "linear-gradient(160deg,#243447,#3c5570)",
        }}
      >
        {b.name[0] ?? "?"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          {b.name}
          {!b.active && (
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 999, padding: "2px 7px" }}>
              Inactive
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: b.igEnabled ? "var(--accent-2)" : "var(--text-muted)" }}>
          {b.igEnabled && b.igUsername ? `Connected as @${b.igUsername}` : b.siteUrl?.replace(/^https?:\/\//, "") ?? "Not connected"}
        </div>
      </div>

      {/* IG connect / disconnect */}
      {b.igEnabled ? (
        <form action={disconnectBrandAction}>
          <input type="hidden" name="brandId" value={b.id} />
          <Button variant="ghost" type="submit">Disconnect IG</Button>
        </form>
      ) : hasToken ? (
        <form action={connectBrandAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="brandId" value={b.id} />
          <select name="account" style={{ padding: "9px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, background: "var(--surface)", color: "var(--text)" }}>
            {accounts.map((a) => <option key={a.igUserId} value={`${a.igUserId}|${a.username}`}>@{a.username} ({a.pageName})</option>)}
          </select>
          <Button variant="primary" type="submit">Connect IG</Button>
        </form>
      ) : (
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Add a token in Settings</span>
      )}

      {/* (Re)activate */}
      {b.active ? (
        <form action={deactivateBrandAction}>
          <input type="hidden" name="brandId" value={b.id} />
          <Button variant="ghost" type="submit">Deactivate</Button>
        </form>
      ) : (
        <form action={activateBrandAction}>
          <input type="hidden" name="brandId" value={b.id} />
          <Button variant="ghost" type="submit">Reactivate</Button>
        </form>
      )}

      {/* Delete — two-step confirm via query param (no client JS) */}
      {confirmDelete ? (
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <form action={deleteBrandAction}>
            <input type="hidden" name="brandId" value={b.id} />
            <Button variant="danger" type="submit">Confirm delete</Button>
          </form>
          <Link href="/connections" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textDecoration: "none" }}>Cancel</Link>
        </span>
      ) : (
        <Link
          href={`/connections?confirmDelete=${b.id}`}
          className="vs-btn"
          style={{ background: "var(--surface)", color: "var(--danger)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
        >
          Delete
        </Link>
      )}
    </Card>
  );
}
