import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatLocalServiceMoney, getLocalServiceMe, getProviderLeads } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceCompanyDashboardPage() {
  const [me, leads] = await Promise.all([getLocalServiceMe(), getProviderLeads()]);
  const provider = me?.providerProfile;

  if (!me) return <Gate title="Bitte einloggen" text="Das Anbieter-Dashboard braucht ein Konto." href="/login?returnTo=/local-services/company/dashboard" label="Einloggen" />;
  if (!provider) return <Gate title="Noch kein Anbieterprofil" text="Aktiviere zuerst lokale Dienstleistungen fuer dein Business." href="/local-services/company/activate" label="Aktivieren" />;
  if (provider.verificationStatus !== "verified") return <Gate title="Freigabe offen" text="Dein Anbieterprofil ist gespeichert, aber noch nicht durch Admin freigeschaltet." href="/local-services/company/activate" label="Status ansehen" />;

  const purchased = leads.filter((lead) => lead.status === "purchased");
  const available = leads.filter((lead) => lead.status !== "purchased");

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label text-hm-business">Anbieter-Dashboard</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Neue Auftraege und gekaufte Leads.</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Verfuegbar" value={String(available.length)} />
          <Metric label="Gekauft" value={String(purchased.length)} />
          <Metric label="Trust Score" value={`${provider.trustScore}/100`} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <LeadList title="Neue Leads" leads={available} empty="Keine neuen passenden Auftraege." />
        <LeadList title="Gekaufte Leads" leads={purchased} empty="Noch keine gekauften Leads." />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-hm-ivory px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-hm-inkSoft">{label}</p>
      <p className="mt-2 text-2xl font-black text-hm-ink">{value}</p>
    </div>
  );
}

function LeadList({ title, leads, empty }: { title: string; leads: Awaited<ReturnType<typeof getProviderLeads>>; empty: string }) {
  return (
    <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <h2 className="hm-display text-3xl text-hm-ink">{title}</h2>
      <div className="mt-4 grid gap-3">
        {leads.length ? leads.map((lead) => (
          <Link key={lead.id} href={`/local-services/company/leads/${lead.id}`} className="flex items-center justify-between gap-4 rounded-xl bg-hm-ivory px-4 py-3">
            <span>
              <span className="block text-sm font-bold text-hm-ink">{lead.project?.title ?? "Auftrag"}</span>
              <span className="text-xs text-hm-inkSoft">{lead.project?.city ?? "Ort geschuetzt"} · Leadpreis {formatLocalServiceMoney(lead.priceCents)}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-hm-inkSoft" />
          </Link>
        )) : <p className="text-sm text-hm-inkSoft">{empty}</p>}
      </div>
    </div>
  );
}

function Gate({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
        <h1 className="hm-display text-4xl text-hm-ink">{title}</h1>
        <p className="mt-3 text-sm text-hm-inkSoft">{text}</p>
        <Link href={href} className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">{label}</Link>
      </section>
    </main>
  );
}
