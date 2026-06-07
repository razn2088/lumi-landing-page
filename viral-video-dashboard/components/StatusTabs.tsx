import Link from "next/link";
const TABS: { key: string; label: string }[] = [
  { key: "rendered", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];
export function StatusTabs({ status, brandId }: { status: string; brandId?: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {TABS.map((t) => {
        const params = new URLSearchParams({ status: t.key, ...(brandId ? { brand: brandId } : {}) });
        const on = t.key === status;
        return (
          <Link key={t.key} href={`/review?${params.toString()}`} style={{ padding: "5px 12px", borderRadius: 16, fontWeight: 700, fontSize: 13, textDecoration: "none", background: on ? "#ffd60a" : "rgba(255,255,255,.14)", color: on ? "#111" : "#fff" }}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
