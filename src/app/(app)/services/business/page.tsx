import Link from "next/link";
import { ArrowRight, Briefcase, ShieldCheck } from "lucide-react";

export default function BusinessServicesPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-business">Business Dienstleistungen</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">B2B-Anfragen nur mit verifizierten Profilen.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          Unternehmen koennen andere Unternehmen als Kunde anfragen, waehrend Anbieterpreise, Leadkosten und Plattformkosten intern bleiben.
          Gleiche Branchen werden nur fuer klar markierte Subunternehmer-Auftraege zugelassen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/local-services?type=business" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
          <Briefcase className="h-6 w-6 text-hm-business" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black text-hm-ink">Anbieter finden</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Oeffnet die bestehende Dienstleistungsplattform im Business-Kontext.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Weiter <ArrowRight className="h-4 w-4" /></span>
        </Link>
        <Link href="/local-services/create?type=business" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
          <ShieldCheck className="h-6 w-6 text-hm-business" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black text-hm-ink">B2B-Auftrag erstellen</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Auftrag einstellen, Subunternehmer-Kontext markieren und Angebote vergleichen.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Auftrag starten <ArrowRight className="h-4 w-4" /></span>
        </Link>
      </section>
    </main>
  );
}
