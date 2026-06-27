export const dynamic = "force-dynamic";

import { getSystemUserToken } from "../../lib/connections";
import { saveTokenAction } from "../../lib/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default async function SettingsPage() {
  const token = await getSystemUserToken();

  return (
    <div style={{ padding: "24px 28px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px" }}>Settings</h1>

      <Card style={{ padding: 20 }}>
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
      </Card>
    </div>
  );
}
