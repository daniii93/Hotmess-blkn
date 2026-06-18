import { ModeSubnav } from "../../components/layout/mode-subnav";

const adminItems = [
  { href: "/admin", labelKey: "dashboard" },
  { href: "/admin/events", labelKey: "events" },
  { href: "/admin/events/hotmess-innsbruck/sales", labelKey: "eventSales" },
  { href: "/admin/events/hotmess-innsbruck/operations", labelKey: "eventOperations" },
  { href: "/admin/events/hotmess-innsbruck/settlement", labelKey: "eventSettlement" },
  { href: "/admin/users", labelKey: "users" },
  { href: "/admin/users/verifications", labelKey: "verifications" },
  { href: "/admin/finance", labelKey: "finance" },
  { href: "/admin/partners", labelKey: "partners" },
  { href: "/admin/partners-program", labelKey: "partnersProgram" },
  { href: "/admin/local-services", labelKey: "localServices" },
  { href: "/admin/codes", labelKey: "codes" },
  { href: "/admin/scanners", labelKey: "scanners" },
  { href: "/admin/moderation", labelKey: "moderation" },
  { href: "/admin/broadcast", labelKey: "broadcast" },
  { href: "/admin/analytics", labelKey: "analytics" },
  { href: "/admin/settings", labelKey: "settings" },
] as const;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-hm-ivory text-hm-ink">
      <ModeSubnav namespace="nav.admin" items={adminItems} accentClass="text-hm-admin" />
      {children}
    </div>
  );
}
