import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, ClipboardList, Wrench } from "lucide-react";

const serviceAreas = [
  {
    title: "Lokale Dienstleistungen",
    text: "Verifizierte Anbieter aus deiner Region, Angebote im HotMess-Chat und geschuetzte Beauftragung.",
    href: "/local-services",
    cta: "Lokale Dienste oeffnen",
    icon: Wrench,
  },
  {
    title: "Business Dienstleistungen",
    text: "B2B-Anfragen, Firmenprofile und verifizierte Anbieter fuer Unternehmen.",
    href: "/services/business",
    cta: "Business Dienste ansehen",
    icon: Briefcase,
  },
  {
    title: "Event Dienstleistungen",
    text: "Dienstleister rund um Events, Personal, Technik, Gastro, Security und Promotion.",
    href: "/services/events",
    cta: "Event Dienste ansehen",
    icon: CalendarDays,
  },
  {
    title: "Auftraege",
    text: "Als Kunde oder Unternehmen einen Auftrag einstellen und passende Angebote erhalten.",
    href: "/local-services/create",
    cta: "Auftrag erstellen",
    icon: ClipboardList,
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-business">Dienstleistungen</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">HotMess verbindet echte Menschen mit echten Moeglichkeiten.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          HotMess ist kein weiteres Social Network. HotMess ist ein verifiziertes Membership-Oekosystem,
          das Menschen, Events, Unternehmen, Dienstleistungen und Vorteile miteinander verbindet.
          Echte Menschen. Echte Events. Echte Geschaefte. Echte Vorteile.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {serviceAreas.map(({ title, text, href, cta, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-hm-business/10 text-hm-business">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowRight className="h-5 w-5 text-hm-inkSoft transition group-hover:translate-x-1 group-hover:text-hm-goldDeep" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-lg font-black text-hm-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
            <p className="mt-5 text-sm font-bold text-hm-goldDeep">{cta}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
