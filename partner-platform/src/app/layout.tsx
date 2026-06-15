import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotMess Partner",
  description: "Separate Vertriebspartner-Plattform fuer HotMess."
};

const dashboardLinks = [
  ["/dashboard", "Uebersicht"],
  ["/dashboard/sales", "Verkaeufe"],
  ["/dashboard/team", "Team"],
  ["/dashboard/tools", "Tools"],
  ["/dashboard/materials", "Material"],
  ["/dashboard/payouts", "Auszahlungen"],
  ["/dashboard/tiers", "Stufen"],
  ["/dashboard/profile", "Profil"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <header className="shell" style={{ padding: "24px 0 12px" }}>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <Link className="display" href="/" style={{ fontSize: 28, fontWeight: 700 }}>HotMess Partner</Link>
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {dashboardLinks.map(([href, label]) => (
                <Link className="pill" href={href} key={href} style={{ border: "1px solid var(--partner-line)", padding: "10px 14px", color: "var(--partner-muted)", whiteSpace: "nowrap" }}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
