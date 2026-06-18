import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  CalendarDays,
  Cpu,
  Database,
  FileText,
  Laptop,
  MessageCircle,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";
import { getDigitalAiData } from "@/features/digital-ai/service";
import { formatEventDate } from "@/features/events/format";

export const dynamic = "force-dynamic";

const solutionTypes = [
  {
    title: "KI Loesungen",
    text: "Konkrete KI-Produkte fuer Support, Vertrieb, Content, Recruiting und Dokumente.",
    state: "Problemorientiert",
    href: "#ai-solutions",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: "KI Agenten",
    text: "Digitale Arbeitskraefte fuer Termine, Leads, Support, Events und Restaurantprozesse.",
    state: "Vorbereitet",
    href: "#ai-agents",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: "Automatisierungen",
    text: "Workflows fuer CRM, E-Mail, Buchhaltung, Ticketing und Projektablauf.",
    state: "Servicebasiert",
    href: "#automation",
    icon: <Settings2 className="h-5 w-5" />,
  },
  {
    title: "Software & SaaS",
    text: "Business-Software, Abos und Tools werden sichtbar, sobald echte Daten existieren.",
    state: "Keine Fake-Tools",
    href: "#software",
    icon: <Laptop className="h-5 w-5" />,
  },
  {
    title: "Digitale Services",
    text: "Website, CRM, Chatbot, KI-Beratung, App/Webentwicklung und Setup-Auftraege.",
    state: "Dienstleistungen",
    href: "#digital-services",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    title: "Business Tools",
    text: "Loesungen fuer Unternehmer, Teams, Anbieter, Creator und lokale Firmen.",
    state: "Business",
    href: "#business-tools",
    icon: <Briefcase className="h-5 w-5" />,
  },
];

const useCases = [
  ["Mehr Kunden gewinnen", "Lead-Prozesse, Funnel, CRM und Angebotsstrecken strukturieren.", "/local-services/create"],
  ["Weniger manuelle Arbeit", "Wiederholbare Aufgaben pruefen und als Automatisierungsauftrag beschreiben.", "/local-services/create"],
  ["Support automatisieren", "FAQ, Kundenservice, Tickets und Anfragen sicher vorbereiten.", "/chat"],
  ["Bewerbungen schneller bearbeiten", "Business Jobs, Bewerbungen und Recruiting-Prozesse verbinden.", "/business/jobs"],
  ["Events einfacher organisieren", "Ticketing, Check-in, Kommunikation und Auswertung ueber Events denken.", "/events"],
  ["Restaurant oder Hotel digitalisieren", "Reservierung, Anfrage, Gaestekommunikation und lokale Prozesse erfassen.", "/local-services/create"],
  ["Dienstleistungsanfragen steuern", "Auftraege sauber beschreiben und mit geprueften Anbietern verbinden.", "/local-services"],
  ["Inhalte schneller erstellen", "Creator-Wissen, Workshops und Content-Prozesse verbinden.", "/creator"],
] as const;

export default async function DigitalAiPage() {
  const data = await getDigitalAiData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const businessActive = Boolean(data.businessMe?.businessEnabled && data.businessMe.profile);
  const providerActive = data.localMe?.providerProfile?.verificationStatus === "verified";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="hm-label text-hm-goldDeep">Digital & AI</p>
            <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">
              Finde gepruefte digitale Loesungen fuer dein Business.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Digital & AI buendelt KI-Agenten, Automatisierungen,
              Software, SaaS, digitale Services, Business Tools und Creator-Wissen.
              Nicht als zufaellige Tool-Liste, sondern als vertrauensbasierter Marktplatz
              fuer echte Probleme, echte Anbieter und nachvollziehbare Ergebnisse.
            </p>
            {!data.verified ? (
              <div className="mt-5 rounded-card border border-hm-gold/30 bg-hm-champagne p-4">
                <p className="text-sm font-black text-hm-ink">Verifizierung erforderlich</p>
                <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
                  Verifiziere dein Profil, um Digital-&-AI-Angebote nutzen oder anbieten zu koennen.
                  Nicht verifizierte Nutzer sehen keine sensiblen Anbieter-, Projekt- oder Kontaktdaten.
                </p>
                <Link href="/verify" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
                  Profil verifizieren <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroButton href="#ai-solutions" icon={<Bot className="h-4 w-4" />} label="Loesungen entdecken" />
            <HeroButton href="#automation" icon={<Settings2 className="h-4 w-4" />} label="Automatisierung finden" />
            <HeroButton href="/local-services/company/activate" icon={<Wrench className="h-4 w-4" />} label="Anbieter werden" />
            <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business Tools" />
            <HeroButton href="/creator" icon={<Sparkles className="h-4 w-4" />} label="Creator-Wissen" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {solutionTypes.map((item) => (
          <OverviewCard key={item.title} {...item} />
        ))}
      </section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section id="ai-solutions" title="KI Loesungen" href="/local-services/create" cta="Auftrag erstellen">
          {data.providers.length ? (
            <div className="grid gap-3">
              {data.providers.slice(0, 4).map((provider) => (
                <ProviderRow key={provider.businessProfileId} provider={provider} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Digital-&-AI-Angebote werden vorbereitet."
              text="Bald findest du hier gepruefte KI-Loesungen, Automatisierungen und Business Tools. Bis echte Anbieter vorhanden sind, zeigen wir keine Fake-Produkte."
              action="Digitalen Auftrag erstellen"
              href="/local-services/create"
            />
          )}
        </Section>

        <Section id="ai-agents" title="KI Agenten" href="/local-services/create" cta="Setup anfragen">
          <div className="grid gap-3">
            <SignalRow icon={<Bot className="h-4 w-4" />} title="Support-Agent" text="FAQ, Kundenfragen und Ticketantworten als Serviceauftrag vorbereiten." href="/local-services/create" />
            <SignalRow icon={<MessageCircle className="h-4 w-4" />} title="Lead-Agent" text="Anfragen vorsortieren, qualifizieren und an passende Anbieter leiten." href="/local-services/create" />
            <SignalRow icon={<CalendarDays className="h-4 w-4" />} title="Event-Agent" text="Gaestekommunikation, Erinnerungen und Check-in-Auswertung vorbereiten." href="/events" />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="automation" title="Automatisierungen" href="/local-services/create" cta="Automatisierung anfragen">
          <div className="grid gap-3">
            {useCases.slice(0, 5).map(([title, text, href]) => (
              <SignalRow key={title} icon={<Settings2 className="h-4 w-4" />} title={title} text={text} href={href} />
            ))}
          </div>
        </Section>

        <Section id="software" title="Software & SaaS" href="/benefits" cta="Benefits ansehen">
          {data.digitalMaterials.length ? (
            <div className="grid gap-3">
              {data.digitalMaterials.map((material) => (
                <SignalRow key={material.id} icon={<FileText className="h-4 w-4" />} title={material.title} text={material.description ?? `Materialtyp: ${material.type}`} href="/benefits" />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Software- und SaaS-Angebote werden vorbereitet."
              text="SaaS-Deals, Tool-Abos und digitale Produkte werden erst gezeigt, wenn echte Partnerdaten und sichere Zahlungswege vorhanden sind."
              action="Member Benefits ansehen"
              href="/benefits"
            />
          )}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        <Section id="digital-services" title="Digitale Services" href="/local-services" cta="Dienstleistungen">
          {data.digitalCategories.length ? (
            <div className="grid gap-3">
              {data.digitalCategories.map((category) => (
                <SignalRow key={category.id} icon={<Wrench className="h-4 w-4" />} title={category.name} text={category.description ?? "Digitalen Service anfragen"} href={`/local-services/create?category=${category.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Digitale Servicekategorien werden vorbereitet."
              text="Website, KI-Beratung, CRM, Chatbot-Setup und Automatisierung koennen bereits als Auftrag beschrieben werden."
              action="Auftrag erstellen"
              href="/local-services/create"
            />
          )}
        </Section>

        <Section id="business-tools" title="Business Tools" href="/business" cta="Business">
          <div className="grid gap-3">
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title="Prozesse verbessern" text="Business-Profil, Kontakte, Jobs und Gruppen als wirtschaftliche Grundlage." href="/business" />
            <SignalRow icon={<Database className="h-4 w-4" />} title="Zahlen auswerten" text="Events, Tickets und Dienstleistungen liefern echte operative Daten." href="/events" />
            <SignalRow icon={<UsersRound className="h-4 w-4" />} title="Experten finden" text="Coffee Chats und Business-Gruppen fuer Digitalthemen nutzen." href="/business/coffee" />
          </div>
        </Section>

        <Section id="creator-bridge" title="Creator Wissen" href="/creator" cta="Creator">
          {(data.creator?.expertPosts ?? []).length ? (
            <div className="grid gap-3">
              {data.creator?.expertPosts.slice(0, 3).map((post) => (
                <SignalRow key={post.id} icon={<Sparkles className="h-4 w-4" />} title={post.author.name} text={post.content ?? "Digitaler Expertenbeitrag"} href="/creator" />
              ))}
            </div>
          ) : (
            <EmptyState
              title="KI-Kurse und digitale Guides werden ueber Creator vorbereitet."
              text="Creator bleibt der Wissensbereich fuer Guides, Workshops, Coachings und Premium-Inhalte."
              action="Creator oeffnen"
              href="/creator"
            />
          )}
        </Section>
      </div>

      <Section id="providers" title="Anbieter & Experten" href="/local-services/company/activate" cta="Anbieter werden">
        {data.providers.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.providers.slice(0, 6).map((provider) => (
              <Link key={provider.businessProfileId} href={`/u/${provider.username}`} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-hm-champagne text-sm font-black text-hm-ink">
                    {provider.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-hm-ink">{provider.company ?? provider.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-hm-inkSoft">{provider.headline}</p>
                    <p className="mt-2 text-xs font-bold text-hm-goldDeep">
                      {provider.verifiedProvider ? "Dienstleister geprueft" : provider.verifiedBusiness ? "Business geprueft" : "Person verifiziert"}
                      {provider.city ? ` - ${provider.city}` : ""}
                    </p>
                  </div>
                </div>
                {provider.expertise.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {provider.expertise.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-hm-porcelain px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Noch keine geprueften Digital-Anbieter verfuegbar."
            text="Sobald verifizierte Business-Profile passende Digital-, KI- oder Automatisierungs-Signale hinterlegt haben, erscheinen sie hier."
            action="Business-Profil ansehen"
            href="/business"
          />
        )}
      </Section>

      <Section id="use-cases" title="Probleme loesen" href="/local-services/create" cta="Auftrag erstellen">
        <div className="grid gap-3 md:grid-cols-2">
          {useCases.map(([title, text, href]) => (
            <SignalRow key={title} icon={<Search className="h-4 w-4" />} title={title} text={text} href={href} />
          ))}
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="events-bridge" title="Events Verbindung" href="/events" cta="Events">
          {data.digitalEvents.length ? (
            <div className="grid gap-3">
              {data.digitalEvents.map((event) => (
                <SignalRow key={event.id} icon={<CalendarDays className="h-4 w-4" />} title={event.title} text={`${event.city} - ${formatEventDate(event.dateStart)}`} href={`/events/${event.slug}`} />
              ))}
            </div>
          ) : (
            <EmptyState title="Digital-Events werden ueber den Event-Hub vorbereitet." text="Workshops, KI-Seminare und Business-Trainings laufen ueber die bestehende Eventstruktur." action="Events oeffnen" href="/events" />
          )}
        </Section>

        <Section id="connect-bridge" title="Connect Verbindung" href="/connect" cta="Connect">
          <div className="grid gap-3">
            <SignalRow icon={<MessageCircle className="h-4 w-4" />} title="Anbieter anschreiben" text="Kontakt laeuft ueber Chat und bestehende Beziehungslogik, nicht ueber oeffentliche Daten." href="/chat" />
            <SignalRow icon={<UsersRound className="h-4 w-4" />} title="Digital-Gruppen" text={data.digitalGroups.length ? `${data.digitalGroups.length} passende Gruppen-Signale gefunden.` : "KI- und Digital-Communities koennen auf Business-Gruppen aufbauen."} href="/business/groups" />
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title="Coffee Chat" text="Experten-Gespraeche bleiben in Business und Connect eingebettet." href="/business/coffee" />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section id="dashboard" title="Anbieter-Dashboard" href={providerActive ? "/local-services/company/dashboard" : "/local-services/company/activate"} cta={providerActive ? "Dashboard" : "Aktivieren"}>
          <EmptyState
            title={providerActive ? "Dein Anbieterprofil ist aktiv." : "Digital-Anbieter-Funktionen werden vorbereitet."}
            text={providerActive ? "Neue Digital-Leads und Serviceanfragen laufen vorerst ueber das bestehende Dienstleister-Dashboard." : "Produkte, Tools, Leads, Abos und Auszahlungen bekommen spaeter eine eigene sichere Steuerzentrale. Bis dahin nutzen Anbieter die Dienstleister-Struktur."}
            action={providerActive ? "Anbieter-Dashboard oeffnen" : "Anbieterprofil aktivieren"}
            href={providerActive ? "/local-services/company/dashboard" : "/local-services/company/activate"}
          />
        </Section>

        <Section id="trust" title="Vertrauen & Qualitaet" href="/profile" cta="Profil">
          <div className="grid gap-3">
            <TrustCard title="Verifizierte Anbieter" text="Nur echte verifizierte Personen, Business-Profile oder Dienstleister werden als geprueft dargestellt." />
            <TrustCard title="Keine Fake-Tools" text="Ohne echte Produkte, Preise und sichere Zahlungslogik zeigen wir Empty States statt erfundener SaaS-Angebote." />
            <TrustCard title="Keine privaten Daten" text="Kaeufer-, Zahlungs-, Chat-, Projekt- und Kundendaten bleiben privat und werden nicht im Marktplatz ausgespielt." />
          </div>
        </Section>
      </div>

      <Section id="monetization" title="Monetarisierung" href={data.isAdmin ? "/admin/analytics" : "/benefits"} cta={data.isAdmin ? "Admin" : "Benefits"}>
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard title="Marketplace-Provision" text="Spaeter Provisionen auf echte digitale Auftraege, Produkte oder SaaS-Deals. Keine unfertige Zahlung live." />
          <TrustCard title="Anbieter-Abos" text="Featured Tools, Digital-Anbieter Plus und Business-Bundles brauchen klare Regeln und Freigabe." />
          <TrustCard title="Creator & Benefits" text="Kurse, Workshops, Tool-Rabatte und Erstberatungen koennen ueber Creator, Events und Benefits verbunden werden." />
        </div>
      </Section>

      <Section id="quick-actions" title="Schnellaktionen" href="/discover" cta="Discover">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroButton href="/digital-ai" icon={<Bot className="h-4 w-4" />} label="Digital & AI entdecken" />
          <HeroButton href="/local-services/create" icon={<Settings2 className="h-4 w-4" />} label="Automatisierung anfragen" />
          <HeroButton href="/local-services" icon={<Wrench className="h-4 w-4" />} label="KI-Beratung finden" />
          <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business Tools ansehen" />
          <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="KI-Workshops" />
          <HeroButton href="/creator" icon={<Sparkles className="h-4 w-4" />} label="Creator-Wissen" />
          <HeroButton href="/local-services/company/activate" icon={<BadgeCheck className="h-4 w-4" />} label="Anbieter werden" />
          <HeroButton href="/chat" icon={<MessageCircle className="h-4 w-4" />} label="Nachricht senden" />
          {businessActive ? <HeroButton href="/business/profile" icon={<Briefcase className="h-4 w-4" />} label="Business-Profil" /> : null}
          {data.isAdmin ? <HeroButton href="/admin/moderation" icon={<ShieldCheck className="h-4 w-4" />} label="Admin Pruefung" /> : null}
        </div>
      </Section>

      <section className="rounded-[2rem] border border-hm-gold/20 bg-hm-ink p-6 text-white shadow-luxury md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="hm-label text-hm-gold">HotMess Philosophie</p>
            <h2 className="mt-3 font-display text-3xl">Echte Menschen. Echte Geschaefte. Echte digitale Moeglichkeiten.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              Digital & AI wird nicht als Hype gebaut, sondern als vertrauensbasierter Loesungsbereich:
              Anbieter muessen nachvollziehbar sein, Angebote muessen echte Probleme loesen, und sensible Daten bleiben geschuetzt.
            </p>
          </div>
          <Link href="/discover" className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-white px-5 py-3 text-sm font-bold text-hm-ink">
            Zurueck zu Discover <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Section({ id, title, href, cta, children }: { id: string; title: string; href: string; cta: string; children: ReactNode }) {
  return (
    <section id={id} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function HeroButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

function OverviewCard({ href, icon, title, text, state }: { href: string; icon: ReactNode; title: string; text: string; state: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{state}</span>
      </div>
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Ansehen <ArrowRight className="h-4 w-4" /></span>
    </Link>
  );
}

function ProviderRow({ provider }: { provider: { businessProfileId: string; username: string; name: string; company: string | null; headline: string; verifiedProvider: boolean; verifiedBusiness: boolean; ratingCount: number; trustSignals: string[] } }) {
  return (
    <Link href={`/u/${provider.username}`} className="flex items-start gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-hm-champagne text-xs font-black text-hm-ink">
        {(provider.company ?? provider.name).slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{provider.company ?? provider.name}</span>
        <span className="block text-xs leading-5 text-hm-inkSoft">{provider.headline}</span>
        <span className="mt-2 block text-[11px] font-bold text-hm-goldDeep">
          {provider.verifiedProvider ? "Dienstleister geprueft" : provider.verifiedBusiness ? "Business geprueft" : "Person verifiziert"}
          {provider.ratingCount ? ` - ${provider.ratingCount} Bewertungen` : ""}
        </span>
      </span>
    </Link>
  );
}

function SignalRow({ href, icon, title, text }: { href?: string; icon: ReactNode; title: string; text: string }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hm-porcelain text-hm-goldDeep">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{title}</span>
        <span className="block text-xs leading-5 text-hm-inkSoft">{text}</span>
      </span>
    </>
  );
  if (!href) return <div className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">{content}</div>;
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      {content}
    </Link>
  );
}

function EmptyState({ title, text, action, href }: { title: string; text: string; action: string; href: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm font-black text-hm-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-card border border-hm-gold/20 bg-hm-ivory p-4">
      <ShieldCheck className="h-5 w-5 text-hm-goldDeep" />
      <h3 className="mt-3 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </div>
  );
}
