import Link from "next/link";
import { ArrowRight, CalendarDays, UsersRound } from "lucide-react";

export default function EventServicesPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-business">Event Dienstleistungen</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">Dienstleister fuer echte Events.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          Event-Personal, Security, Gastro, Technik, Promotion und Kreativleistungen werden als eigene Struktur vorbereitet.
          Der bestehende lokale Dienstleistungsfluss bleibt die technische Basis.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/local-services?type=event" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
          <CalendarDays className="h-6 w-6 text-hm-business" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black text-hm-ink">Event-Anbieter ansehen</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Fuehrt in die vorhandene Anbieterstruktur, gefiltert fuer Event-Kontext.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Weiter <ArrowRight className="h-4 w-4" /></span>
        </Link>
        <Link href="/local-services/create?type=event" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
          <UsersRound className="h-6 w-6 text-hm-business" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black text-hm-ink">Event-Auftrag erstellen</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Personal oder Dienstleistung fuer ein Event anfragen.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Auftrag starten <ArrowRight className="h-4 w-4" /></span>
        </Link>
      </section>
    </main>
  );
}
