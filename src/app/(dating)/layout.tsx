import { ModeSubnav } from "../../components/layout/mode-subnav";

const datingItems = [
  { href: "/dating", labelKey: "discover" },
  { href: "/dating/likes", labelKey: "likes" },
  { href: "/dating/matches", labelKey: "matches" },
  { href: "/dating/profile", labelKey: "profile" },
] as const;

export default function DatingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-hm-ivory text-hm-ink">
      <ModeSubnav namespace="nav.dating" items={datingItems} accentClass="text-hm-dating" />
      {children}
    </div>
  );
}
