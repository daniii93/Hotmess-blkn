import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, ChevronRight, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { formatLocalServiceMoney, getLocalServiceCategories, getLocalServiceMe, getMyLocalServiceOrders, getMyLocalServiceProjects } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServicesPage() {
  const [me, categories, projects, orders] = await Promise.all([
    getLocalServiceMe(),
    getLocalServiceCategories(),
    getMyLocalServiceProjects(),
    getMyLocalServiceOrders(),
  ]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr] lg:items-end">
          <div>
            <p className="hm-label text-hm-business">Lokale Dienstleistungen</p>
            <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">Verifizierte Anbieter aus deiner Region.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-hm-inkSoft">
              Stelle einen Auftrag ein, erhalte Angebote in HotMess und bezahle erst, wenn ein verifizierter Anbieter ueber die Plattform beauftragt wird.
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/local-services/create" className="inline-flex items-center justify-between rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
              Auftrag einstellen <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/local-services/company/activate" className="inline-flex items-center justify-between rounded-pill border border-hm-gold/35 px-5 py-3 text-sm font-bold text-hm-ink">
              Anbieterbereich <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Verifizierung Pflicht" text="Kunden und Anbieter muessen verifiziert sein. Nicht verifizierte Profile bleiben unsichtbar." />
        <InfoCard icon={<BadgeCheck className="h-5 w-5" />} title="Kontakt geschuetzt" text="Kontaktdaten werden erst freigegeben, wenn du ein Angebot verbindlich annimmst." />
        <InfoCard icon={<BriefcaseBusiness className="h-5 w-5" />} title="Getrennte Rollen" text="Kunden sehen Angebote und Auftraege. Anbieter sehen Leads, interne Kosten und Abwicklung." />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RoleCard
          icon={<UserRound className="h-5 w-5" />}
          title="Kundensicht"
          text="Auftrag einstellen, Angebote vergleichen, Anbieter beauftragen und nach Abschluss bewerten."
          href="/local-services/create"
          cta="Auftrag starten"
          primary
        />
        <RoleCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title={me?.providerProfile?.verificationStatus === "verified" ? "Anbietersicht aktiv" : "Anbietersicht"}
          text="Leads bearbeiten, Leadkosten sehen, Angebote senden und Auftraege professionell abwickeln."
          href={me?.providerProfile?.verificationStatus === "verified" ? "/local-services/company/dashboard" : "/local-services/company/activate"}
          cta={me?.providerProfile?.verificationStatus === "verified" ? "Anbieter-Dashboard" : "Anbieter werden"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.55fr_0.45fr]">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="hm-label">Kategorien</p>
              <h2 className="hm-display mt-2 text-3xl text-hm-ink">Was brauchst du?</h2>
            </div>
            <Wrench className="h-6 w-6 text-hm-business" />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {categories.slice(0, 12).map((category) => (
              <Link key={category.id} href={`/local-services/create?category=${category.id}`} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 hover:border-hm-gold/50">
                <span className="block text-sm font-bold text-hm-ink">{category.name}</span>
                <span className="mt-1 block text-xs text-hm-inkSoft">Verifizierte Anbieter · Angebote ueber HotMess</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <StatusPanel me={me} />
          <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <p className="hm-label">Meine Auftraege</p>
            <div className="mt-4 grid gap-3">
              {projects.length ? projects.slice(0, 4).map((project) => (
                <Link key={project.id} href={`/local-services/customer/projects/${project.id}/offers`} className="rounded-xl bg-hm-ivory px-4 py-3">
                  <span className="block text-sm font-bold text-hm-ink">{project.title}</span>
                  <span className="text-xs text-hm-inkSoft">{project.status} · {project.category?.name ?? "Kategorie offen"}</span>
                </Link>
              )) : <p className="text-sm text-hm-inkSoft">Noch keine Auftraege. Starte mit deinem ersten Projekt.</p>}
            </div>
          </div>
          <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <p className="hm-label">Aktive Bestellungen</p>
            <div className="mt-4 grid gap-3">
              {orders.length ? orders.slice(0, 3).map((order) => (
                <Link key={order.id} href={`/local-services/orders/${order.id}`} className="rounded-xl bg-hm-ivory px-4 py-3">
                  <span className="block text-sm font-bold text-hm-ink">{formatLocalServiceMoney(order.totalAmountCents)}</span>
                  <span className="text-xs text-hm-inkSoft">{order.status}</span>
                </Link>
              )) : <p className="text-sm text-hm-inkSoft">Noch keine beauftragten Dienstleistungen.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-hm-business/10 text-hm-business">{icon}</div>
      <h2 className="mt-4 text-sm font-bold text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
    </div>
  );
}

function StatusPanel({ me }: { me: Awaited<ReturnType<typeof getLocalServiceMe>> }) {
  if (!me) {
    return (
      <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="text-sm font-bold text-hm-ink">Bitte einloggen.</p>
        <Link href="/login?returnTo=/local-services" className="mt-3 inline-flex rounded-pill bg-hm-ink px-4 py-2 text-xs font-bold text-white">Einloggen</Link>
      </div>
    );
  }
  if (!me.verified) {
    return (
      <div className="rounded-card border border-hm-gold/30 bg-hm-champagne/60 p-5 shadow-luxury">
        <p className="text-sm font-bold text-hm-ink">Verifizierung erforderlich.</p>
        <p className="mt-2 text-sm text-hm-inkSoft">Auftraege und Angebote sind erst nach Identitaetspruefung aktiv.</p>
        <Link href="/verify" className="mt-3 inline-flex rounded-pill bg-hm-ink px-4 py-2 text-xs font-bold text-white">Jetzt verifizieren</Link>
      </div>
    );
  }
  if (me.providerProfile?.verificationStatus === "verified") {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 p-5 shadow-luxury">
        <p className="text-sm font-bold text-emerald-800">Anbieter aktiv</p>
        <p className="mt-2 text-sm text-emerald-700">Interne Leadkosten und Anbieterfunktionen findest du nur im Anbieter-Dashboard.</p>
        <Link href="/local-services/company/dashboard" className="mt-3 inline-flex rounded-pill bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Anbieter-Dashboard</Link>
      </div>
    );
  }
  return (
    <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="text-sm font-bold text-hm-ink">Kundenmodus aktiv</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Business-Anbieter koennen das Modul separat beantragen.</p>
      <Link href="/local-services/company/activate" className="mt-3 inline-flex rounded-pill border border-hm-gold/30 px-4 py-2 text-xs font-bold text-hm-ink">Anbieter werden</Link>
    </div>
  );
}

function RoleCard({ icon, title, text, href, cta, primary = false }: { icon: React.ReactNode; title: string; text: string; href: string; cta: string; primary?: boolean }) {
  return (
    <div className={`rounded-card border p-5 shadow-luxury ${primary ? "border-hm-gold/35 bg-hm-champagne/45" : "border-hm-border bg-hm-porcelain"}`}>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-hm-business/10 text-hm-business">{icon}</div>
      <h2 className="mt-4 text-base font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className={`mt-5 inline-flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-bold ${primary ? "bg-hm-ink text-white" : "border border-hm-gold/35 text-hm-ink"}`}>
        {cta} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
