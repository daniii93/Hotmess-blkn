import Link from "next/link";
import { ArrowRight, Bot, Cpu, ShieldCheck } from "lucide-react";

export default function DigitalAiPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Digital & AI</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-5xl">Digitale Produkte und KI-Angebote, aber verifiziert.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-hm-inkSoft">
          HotMess ist kein weiteres Social Network. Der Digital-&-AI-Bereich wird als gepruefter Marktplatz vorbereitet:
          echte Anbieter, echte Kaeufer, klare Sichtbarkeit und keine anonymen Bots.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "KI-Marktplatz", text: "Vorbereitet fuer Automatisierungen, digitale Produkte und AI-Services.", icon: Bot },
          { title: "Digitale Tools", text: "Struktur fuer Vorlagen, Workflows und abonnementfaehige Angebote.", icon: Cpu },
          { title: "Vertrauen zuerst", text: "Anbieter werden erst nach Pruefung sichtbar.", icon: ShieldCheck },
        ].map(({ title, text, icon: Icon }) => (
          <article key={title} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
            <Icon className="h-6 w-6 text-hm-goldDeep" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft">Coming soon <ArrowRight className="h-4 w-4" /></span>
          </article>
        ))}
      </section>

      <Link href="/settings" className="inline-flex w-fit rounded-pill border border-hm-gold/35 px-5 py-3 text-sm font-bold text-hm-ink">Module in Einstellungen ansehen</Link>
    </main>
  );
}
