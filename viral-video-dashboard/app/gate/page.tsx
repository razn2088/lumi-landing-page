import { gateLoginAction } from "../../lib/actions";

export const dynamic = "force-dynamic";

export default async function GatePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#0f1830,#0b1226)" }}>
      <form
        action={gateLoginAction}
        style={{ width: 340, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div style={{ fontWeight: 800, fontSize: 20 }}>▦ Viral Studio</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Enter the access password to continue.</div>
        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          style={{ padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--surface)", color: "var(--text)" }}
        />
        {sp.error ? <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>Incorrect password. Try again.</div> : null}
        <button
          type="submit"
          style={{ background: "var(--accent)", color: "#fff", border: 0, borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
