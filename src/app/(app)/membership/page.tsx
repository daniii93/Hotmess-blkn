import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Gift, ShieldCheck, Smartphone, Sparkles, UserCheck } from "lucide-react";
import { getFoundationData } from "@/features/foundations/service";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const data = await getFoundationData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Membership / HotMess Plus</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">
          Deine HotMess Mitgliedschaft als Schaltzentrale.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
          Hallo {firstName}. HotMess Plus wird als Vorteilsstruktur vorbereitet:
          Event-Vorteile, Benefits, Business Plus, Provider Plus, Creator- und Digital-Angebote.
          Aktive Abos werden nur aus echten vorhandenen Tabellen gelesen. Keine unfertigen Zahlungen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Basis-Mitglied" value={data.profile?.verification_status === "verified" ? "Aktiv" : "Verifizierung offen"} text="Verifizierte Basisnutzung bleibt die Grundlage." icon={<UserCheck className="h-5 w-5" />} href="/verify" />
        <StatusCard title="HotMess Plus" value="Vorbereitet" text="Member Benefits, Event-Vorteile und Deals werden gebuendelt." icon={<Sparkles className="h-5 w-5" />} href="/benefits" />
        <StatusCard title="Mobile App" value={data.pwa.manifest && data.pwa.serviceWorker ? "PWA Basis aktiv" : "Pruefen"} text={data.pwa.note} icon={<Smartphone className="h-5 w-5" />} href="/settings/display" />
      </section>

      <section className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl text-hm-ink">Rollen & Freigaben</h2>
            <Link href="/onboarding" className="text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">Onboarding</Link>
          </div>
          <div className="grid gap-3">
            {data.roleReadiness.map((role) => (
              <Link key={role.label} href={role.href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${role.active ? "bg-green-50 text-green-700" : "bg-hm-champagne text-hm-inkSoft"}`}>
                  {role.active ? <BadgeCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-hm-ink">{role.label}</span>
                  <span className="block text-xs text-hm-inkSoft">{role.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="font-display text-2xl text-hm-ink">Aktive Premium-Signale</h2>
          <div className="mt-5 grid gap-3">
            {data.memberships.map((membership) => (
              <div key={membership.label} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
                <p className="font-display text-3xl text-hm-ink">{membership.value}</p>
                <p className="mt-1 text-sm font-bold text-hm-ink">{membership.label}</p>
                <p className="mt-1 text-xs text-hm-inkSoft">{membership.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="hm-label text-hm-goldDeep">Vorteile ohne Druck</p>
            <h2 className="font-display text-3xl text-hm-ink">Membership zeigt Wert, nicht Zwang.</h2>
          </div>
          <Link href="/benefits" className="inline-flex items-center gap-2 rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink">
            Benefits ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <BenefitCard title="Event-Vorteile" text="Early Access, VIP, Add-ons und Wartelisten-Vorteile werden nur aus echten Eventdaten abgeleitet." icon={<Gift className="h-5 w-5" />} />
          <BenefitCard title="Business Plus" text="Business-Sichtbarkeit, Jobs und Analytics bleiben getrennt und werden nicht mit Dating vermischt." icon={<Briefcase className="h-5 w-5" />} />
          <BenefitCard title="Provider Plus" text="Lead-Vorteile und Anbieterfunktionen laufen ueber Dienstleistungsfreigaben." icon={<BadgeCheck className="h-5 w-5" />} />
        </div>
      </section>
    </main>
  );
}

function StatusCard({ title, value, text, icon, href }: { title: string; value: string; text: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{title}</p>
      <h2 className="mt-2 text-xl font-black text-hm-ink">{value}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function BenefitCard({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-card border border-hm-gold/20 bg-hm-ivory p-4">
      <span className="text-hm-goldDeep">{icon}</span>
      <h3 className="mt-3 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </article>
  );
}
