import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { getFoundationData } from "@/features/foundations/service";

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const data = await getFoundationData();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Trust System</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">
          Vertrauen entsteht durch echte Signale, nicht durch leere Badges.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
          HotMess ist kein Social-Credit-System. Wir zeigen keine privaten Sanktionen,
          keine Dating-Aktivitaet und keine sensiblen Daten. Sichtbar werden nur
          nachvollziehbare Vertrauenssignale: Verifizierung, gepruefte Unternehmen,
          echte Auftraege, Bewertungen, transparente Events und freigegebene Anbieter.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
            Mitglied werden <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/discover" className="inline-flex items-center gap-2 rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink">
            Moeglichkeiten entdecken <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.trustSignals.map((signal) => (
          <article key={signal.label} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <BadgeCheck className="h-6 w-6 text-hm-goldDeep" />
            <p className="mt-4 font-display text-3xl text-hm-ink">{signal.value}</p>
            <p className="mt-1 text-sm font-bold text-hm-ink">{signal.label}</p>
            <p className="mt-2 text-xs leading-5 text-hm-inkSoft">Aggregiertes echtes Plattformsignal. Keine personenbezogene Detailanzeige.</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <TrustPrinciple title="Keine Fake-Reputation" text="Badges erscheinen nur, wenn eine echte Datenbasis vorhanden ist." />
        <TrustPrinciple title="Keine privaten Risiken" text="Reports, Sanktionen, Streitfaelle und Moderation bleiben Admin-intern." />
        <TrustPrinciple title="Featured ist nicht Trust" text="Bezahlte Sichtbarkeit wird spaeter klar gekennzeichnet und nie mit Vertrauen verwechselt." />
      </section>

      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="hm-label text-hm-goldDeep">Plattform-Fundament</p>
            <h2 className="font-display text-3xl text-hm-ink">Echte Menschen. Echte Events. Echte Geschaefte. Echte Vorteile.</h2>
          </div>
          <Link href="/membership" className="inline-flex items-center gap-2 rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink">
            Membership ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function TrustPrinciple({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-card border border-hm-gold/20 bg-hm-porcelain p-5 shadow-luxury">
      <ShieldCheck className="h-6 w-6 text-hm-goldDeep" />
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
    </article>
  );
}
