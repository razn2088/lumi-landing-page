import "./theme.css";
import { Shell } from "../components/Shell";

export const metadata = { title: "Viral Studio" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
