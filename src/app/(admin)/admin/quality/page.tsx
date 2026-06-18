import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, ShieldAlert, Smartphone, UserCheck } from "lucide-react";
import { PageShell } from "@/components/shell/page-shell";
import { getFoundationData } from "@/features/foundations/service";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const data = await getFoundationData();

  return (
    <>
      <PageShell pageKey="admin" emptyKey="admin" accent="admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:px-10">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <p className="hm-label text-hm-admin">Admin Quality Control</p>
          <h1 className="hm-display mt-2 text-4xl text-hm-ink">Qualitaet, Trust, Rollen und Umsatzrisiken an einem Ort.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-hm-inkSoft">
            Diese Ansicht ersetzt keine bestehenden Admin-Bereiche. Sie verbindet offene Qualitaetsaufgaben,
            Trust-Signale, Membership-Status, Rollenfreigaben und Monetarisierungsmodelle als zentrale Steuerkarte.
            Private Details bleiben in den jeweiligen Admin-Modulen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {data.internalQuality.map((item) => (
            <Link key={item.label} href={item.href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-admin/60">
              <ShieldAlert className="h-5 w-5 text-hm-admin" />
              <p className="mt-4 font-display text-3xl text-hm-ink">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{item.label}</p>
            </Link>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
          <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-hm-ink">Oeffentliche Trust-Signale</h2>
              <Link href="/trust" className="text-xs font-bold uppercase tracking-[0.12em] text-hm-admin">Trust Page</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.trustSignals.map((signal) => (
                <div key={signal.label} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
                  <p className="font-display text-3xl text-hm-ink">{signal.value}</p>
                  <p className="mt-1 text-sm font-bold text-hm-ink">{signal.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <h2 className="font-display text-2xl text-hm-ink">Letzte Audit-Aktionen</h2>
            <div className="mt-5 grid gap-3">
              {data.recentAudit.length ? data.recentAudit.map((audit) => (
                <div key={audit.id} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
                  <p className="text-sm font-bold text-hm-ink">{audit.action}</p>
                  <p className="mt-1 text-xs text-hm-inkSoft">{audit.targetType ?? "target"}{audit.reason ? ` - ${audit.reason}` : ""}</p>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5 text-sm text-hm-inkSoft">
                  Aktuell gibt es keine offenen Qualitaetsaufgaben oder Audit-Signale.
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <FoundationCard title="Onboarding & Rollen" icon={<UserCheck className="h-5 w-5" />} href="/admin/users" rows={data.roleReadiness.map((role) => `${role.label}: ${role.active ? "aktiv" : "offen"}`)} />
          <FoundationCard title="Membership" icon={<BadgeCheck className="h-5 w-5" />} href="/admin/settings" rows={data.memberships.map((item) => `${item.label}: ${item.value}`)} />
          <FoundationCard title="Mobile / PWA" icon={<Smartphone className="h-5 w-5" />} href="/admin/settings" rows={[
            `Manifest: ${data.pwa.manifest ? "vorhanden" : "offen"}`,
            `Service Worker: ${data.pwa.serviceWorker ? "vorhanden" : "offen"}`,
            "Push/Install-Prompt: nicht als fertig behauptet",
          ]} />
        </section>

        <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl text-hm-ink">Monetarisierung je Bereich</h2>
            <Banknote className="h-5 w-5 text-hm-admin" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.monetization.map((item) => (
              <Link key={item.area} href={item.href} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-admin/60">
                <p className="text-sm font-black text-hm-ink">{item.area}</p>
                <p className="mt-1 text-xs leading-5 text-hm-inkSoft">{item.model}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-hm-admin">{item.status}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

function FoundationCard({ title, icon, href, rows }: { title: string; icon: React.ReactNode; href: string; rows: string[] }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-admin/10 text-hm-admin">{icon}</span>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-admin">
          Oeffnen <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <p key={row} className="rounded-xl border border-hm-border bg-hm-ivory px-3 py-2 text-xs text-hm-inkSoft">{row}</p>
        ))}
      </div>
    </section>
  );
}
