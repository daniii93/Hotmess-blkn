import { CalendarDays, MapPin, QrCode, Share2, ShieldCheck, Smartphone, Ticket } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const upcoming = [
  { label: "Innsbruck", value: "September 2026" },
  { label: "Wien", value: "Herbst 2026" },
  { label: "Muenchen", value: "Coming next" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-hm-ivory text-hm-ink">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="max-w-3xl">
          <p className="hm-label">HotMess</p>
          <h1 className="hm-display mt-5 text-5xl text-hm-ink sm:text-7xl lg:text-8xl">
            Balkan Events. Neue Menschen. Ein Abend, der bleibt.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-hm-inkSoft">
            Die Social-Event-Plattform fuer die Ex-Yugoslavia Community in DACH und Italien:
            Events, Tickets, Freunde, Chat und verifizierte Profile in einer installierbaren Web-App.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-hm-inkSoft">
            HotMess ist kein weiteres Social Network. HotMess ist ein verifiziertes Membership-Oekosystem,
            das Menschen, Events, Unternehmen, Dienstleistungen und Vorteile miteinander verbindet.
            Echte Menschen. Echte Events. Echte Geschaefte. Echte Vorteile.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-hm-ink px-6 py-4 text-sm font-semibold text-hm-ivory transition hover:bg-hm-goldDeep"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Zur Warteliste
            </a>
            <a
              href="/event/innsbruck-2026-09"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-hm-border bg-hm-porcelain px-6 py-4 text-sm font-semibold text-hm-ink transition hover:border-hm-gold"
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              Naechstes Event ansehen
            </a>
          </div>
        </div>

        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <div className="aspect-[4/5] rounded-card bg-hm-ink p-5 text-hm-ivory">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-luxury text-hm-gold">
              <span>Live Preview</span>
              <span>50/50</span>
            </div>
            <div className="mt-12">
              <p className="font-display text-5xl leading-none">HotMess Innsbruck</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-hm-champagne">
                <MapPin className="size-4" aria-hidden="true" />
                Secret venue, Innsbruck
              </p>
            </div>
            <div className="mt-12 grid gap-3">
              {upcoming.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-card border border-white/15 bg-white/[0.08] px-4 py-3">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-sm text-hm-champagne">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-card bg-hm-ivory p-4 text-hm-ink">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-hm-gold text-hm-ink">
                  <Ticket className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">QR-Ticket bereit</p>
                  <p className="text-xs text-hm-inkSoft">Verifiziert, personalisiert, einmal scanbar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-hm-border bg-hm-porcelain">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="hm-label">PWA</p>
            <h2 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">HotMess auf deinem Handy</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-hm-inkSoft">
              HotMess laeuft direkt im Browser und kann als App auf den Homescreen gelegt werden.
              Ohne Store, ohne Download-Barriere, mit Icon und Vollbild-Ansicht.
            </p>
          </div>

          <div className="grid gap-4">
            <InstallPrompt />
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-card border border-hm-border bg-hm-ivory p-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-hm-ink text-hm-ivory">
                  <Share2 className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-hm-ink">iPhone</h3>
                <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
                  Safari oeffnen, Teilen-Symbol antippen und "Zum Home-Bildschirm" auswaehlen.
                </p>
              </article>
              <article className="rounded-card border border-hm-border bg-hm-ivory p-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-hm-ink text-hm-ivory">
                  <Smartphone className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-hm-ink">Android</h3>
                <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
                  Chrome zeigt den Installationsbutton automatisch an oder bietet "App installieren" im Menue.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["Verifizierte Community", "Identitaet, Profil und Privatsphaere bilden das Fundament."],
          ["Ticketing mit Einlass", "Reservierung, Zahlung, QR-Ticket und Scanner sind vorbereitet."],
          ["Social Motor", "Feed, Chat, Freunde-Aktivitaet, Dating und Business greifen ineinander."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
            <QrCode className="size-5 text-hm-goldDeep" aria-hidden="true" />
            <h3 className="mt-5 text-lg font-semibold text-hm-ink">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-hm-inkSoft">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
