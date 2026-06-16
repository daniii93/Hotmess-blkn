import { ModeSubnav } from "../../components/layout/mode-subnav";
import { BottomNav } from "../../components/navigation/BottomNav";

const businessItems = [
  { href: "/business", labelKey: "network" },
  { href: "/business/jobs", labelKey: "jobs" },
  { href: "/business/coffee", labelKey: "coffee" },
  { href: "/business/groups", labelKey: "groups" },
  { href: "/business/profile", labelKey: "profile" },
] as const;

export default function BusinessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-hm-ivory pb-24 text-hm-ink">
      <ModeSubnav namespace="nav.business" items={businessItems} accentClass="text-hm-business" />
      {children}
      <BottomNav />
    </div>
  );
}
