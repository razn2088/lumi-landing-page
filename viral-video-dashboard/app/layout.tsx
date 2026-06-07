export const metadata = { title: "Viral Studio" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif", background: "#f3f5f8", color: "#0f1830" }}>{children}</body>
    </html>
  );
}
