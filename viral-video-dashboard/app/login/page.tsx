"use client";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  async function signIn() {
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,.08)", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22 }}>Viral Studio</h1>
        <p style={{ margin: "0 0 22px", color: "#667" }}>Review queue</p>
        <button onClick={signIn} style={{ background: "#0f1830", color: "#fff", border: 0, borderRadius: 8, padding: "12px 22px", fontSize: 15, cursor: "pointer" }}>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
