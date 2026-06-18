import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Video } from "lucide-react";

export default function CreatorPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Creator</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">Creator Economy fuer echte Profile.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          Dieser Bereich ist vorbereitet fuer verifizierte Creator, digitale Produkte, Coachings,
          Premium-Inhalte und Event-nahe Reichweite. Bis zur Freigabe bleibt es eine Uebersicht.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Verifizierte Creator", text: "Kein anonymes Verkaufen: aktive Creator brauchen ein geprueftes Profil.", icon: BadgeCheck },
          { title: "Premium Inhalte", text: "Struktur fuer Inhalte, Kurse und Membership-Angebote.", icon: Video },
          { title: "Event Reichweite", text: "Creator koennen spaeter mit Events, Partnern und Benefits verbunden werden.", icon: Sparkles },
        ].map(({ title, text, icon: Icon }) => (
          <article key={title} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <Icon className="h-6 w-6 text-hm-goldDeep" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft">Coming soon <ArrowRight className="h-4 w-4" /></span>
          </article>
        ))}
      </section>

      <Link href="/profile" className="inline-flex w-fit rounded-pill border border-hm-gold/35 px-5 py-3 text-sm font-bold text-hm-ink">Profil pruefen</Link>
    </main>
  );
}
