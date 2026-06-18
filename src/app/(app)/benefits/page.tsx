import Link from "next/link";
import { ArrowRight, Gift, Hotel, TicketPercent } from "lucide-react";

export default function BenefitsPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Benefits</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">Vorteile fuer verifizierte Mitglieder.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          HotMess verbindet echte Menschen mit echten Moeglichkeiten: Partner-Vorteile, Hotel-Deals,
          Event-Benefits und spaeter exklusive Membership-Angebote.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Event Benefits", text: "Rabatte, Wartelisten-Vorteile und exklusive Aktionen rund um Events.", icon: TicketPercent, href: "/events" },
          { title: "Hotel & Travel", text: "Vorbereitet fuer Hotelpartner, Codes und Wochenend-Angebote.", icon: Hotel, href: "/tickets" },
          { title: "Partner Vorteile", text: "Coming soon: Vorteile von verifizierten Partnern und Unternehmen.", icon: Gift, href: "/benefits" },
        ].map(({ title, text, icon: Icon, href }) => (
          <Link key={title} href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
            <Icon className="h-6 w-6 text-hm-goldDeep" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Ansehen <ArrowRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
