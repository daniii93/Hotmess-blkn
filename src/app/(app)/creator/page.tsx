import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  MessageCircle,
  PlaySquare,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import { getCreatorData } from "@/features/creator/service";
import { formatEventDate } from "@/features/events/format";

export const dynamic = "force-dynamic";

export default async function CreatorPage() {
  const data = await getCreatorData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const businessActive = Boolean(data.businessMe?.businessEnabled && data.businessMe.profile);
  const providerActive = data.localMe?.providerProfile?.verificationStatus === "verified";

  const overview = [
    {
      title: "Creator Profile",
      text: data.experts.length
        ? `${data.experts.length} verifizierte Experten-Signale aus Business-Profilen.`
        : "Gepruefte Experten entdecken, sobald Creator-Freigaben aktiv sind.",
      state: data.experts.length ? "Daten aktiv" : "Vorbereitet",
      href: "#profiles",
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      title: "Digitale Produkte",
      text: "Guides, Vorlagen, E-Books, Tools und Dateien werden vorbereitet.",
      state: "Keine Kaeufe live",
      href: "#products",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Coachings",
      text: "Anfragen laufen vorerst sicher ueber Chat, Business oder Dienstleistungen.",
      state: "Sicher verlinkt",
      href: "#coaching",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      title: "Kurse",
      text: "Live-Workshops und Seminare laufen ueber die bestehende Event-Struktur.",
      state: data.counts.creatorEvents ? "Events aktiv" : "Vorbereitet",
      href: "#courses",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      title: "Premium Inhalte",
      text: data.counts.expertPosts ? "Expertise-Posts werden als Signal gelesen." : "Premium Content wird vorbereitet.",
      state: data.counts.expertPosts ? "Content-Signale" : "Keine Paywall live",
      href: "#premium",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Community Programme",
      text: data.groups.length ? `${data.groups.length} offene Business-Gruppen als sichere Grundlage.` : "Masterminds und Lernraeume werden vorbereitet.",
      state: data.groups.length ? "Gruppen aktiv" : "Vorbereitet",
      href: "#community",
      icon: <UsersRound className="h-5 w-5" />,
    },
  ];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="hm-label text-hm-goldDeep">Creator</p>
            <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">
              Lerne von verifizierten Experten.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Creator ist HotMess fuer echtes Wissen: Coachings, Kurse,
              digitale Produkte, Premium-Inhalte, Communities und Workshops von echten Menschen
              mit nachvollziehbarer Erfahrung. Kein Influencer-Laerm, keine Fake-Kurse.
            </p>
            {!data.verified ? (
              <div className="mt-5 rounded-card border border-hm-gold/30 bg-hm-champagne p-4">
                <p className="text-sm font-black text-hm-ink">Verifizierung erforderlich</p>
                <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
                  Verifiziere dein Profil, um Creator-Angebote zu nutzen oder spaeter selbst Creator zu werden.
                </p>
                <Link href="/verify" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
                  Profil verifizieren <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroButton href="#profiles" icon={<BadgeCheck className="h-4 w-4" />} label="Creator entdecken" />
            <HeroButton href={businessActive ? "/business/profile" : "/business"} icon={<Briefcase className="h-4 w-4" />} label="Als Creator starten" />
            <HeroButton href="#coaching" icon={<MessageCircle className="h-4 w-4" />} label="Coachings ansehen" />
            <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Creator Events" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {overview.map((item) => (
          <OverviewCard key={item.title} {...item} />
        ))}
      </section>

      <Section id="profiles" title="Creator Profile" cta="Business Experten" href="/business">
        {data.experts.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.experts.slice(0, 6).map((expert) => (
              <Link key={expert.userId} href={`/u/${expert.username}`} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-hm-champagne text-sm font-black text-hm-ink">
                    {expert.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-hm-ink">{expert.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-hm-inkSoft">{expert.headline}</p>
                    <p className="mt-2 text-xs font-bold text-hm-goldDeep">
                      {expert.verifiedBusiness ? "Business geprueft" : "Person verifiziert"}{expert.city ? ` - ${expert.city}` : ""}
                    </p>
                  </div>
                </div>
                {expert.expertise.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {expert.expertise.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-hm-porcelain px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Creator-Funktionen werden vorbereitet."
            text="Bald findest du hier verifizierte Experten, Coachings und digitale Produkte. Bis echte Freigaben existieren, zeigen wir keine Fake-Creator."
            action="Business ansehen"
            href="/business"
          />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-3">
        <Section id="products" title="Digitale Produkte" cta="Profil bearbeiten" href="/profile/edit">
          <EmptyState
            title="Digitale Produkte werden vorbereitet."
            text="Creator koennen kuenftig Vorlagen, Guides, E-Books und Tools anbieten. Solange Zahlungs- und Downloadlogik nicht fertig ist, gibt es keine Kaufbuttons."
            action="Profil vorbereiten"
            href="/profile/edit"
          />
        </Section>

        <Section id="coaching" title="Coachings" cta="Chat oeffnen" href="/chat">
          <div className="grid gap-3">
            <SignalRow icon={<MessageCircle className="h-4 w-4" />} title="Coaching anfragen" text="Vorerst sicher ueber Chat, Business-Profil oder Dienstleistungsauftrag." href="/chat/new" />
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title="Business Coaching" text="Unternehmer, Trainer und Berater bleiben im Business-Kontext nachvollziehbar." href="/business" />
            <SignalRow icon={<Wrench className="h-4 w-4" />} title="Beratung als Dienstleistung" text="Konkrete Auftraege laufen ueber lokale Dienstleistungen." href="/local-services/create" />
          </div>
        </Section>

        <Section id="courses" title="Kurse & Workshops" cta="Events" href="/events">
          {data.creatorEvents.length ? (
            <div className="grid gap-3">
              {data.creatorEvents.map((event) => (
                <SignalRow key={event.id} icon={<CalendarDays className="h-4 w-4" />} title={event.title} text={`${event.city} - ${formatEventDate(event.dateStart)}`} href={`/events/${event.slug}`} />
              ))}
            </div>
          ) : (
            <EmptyState title="Kurse und Workshops werden vorbereitet." text="Live-Kurse laufen ueber den bestehenden Event-Hub. Eine separate Kursplattform wird nicht unfertig live geschaltet." action="Workshops entdecken" href="/events" />
          )}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="premium" title="Premium Inhalte" cta="Feed" href="/feed">
          {data.expertPosts.length ? (
            <div className="grid gap-3">
              {data.expertPosts.map((post) => (
                <SignalRow key={post.id} icon={<BookOpen className="h-4 w-4" />} title={post.author.name} text={`${post.likesCount} Likes - ${post.content ?? "Expertenbeitrag"}`} href="/feed" />
              ))}
            </div>
          ) : (
            <EmptyState title="Premium Inhalte werden vorbereitet." text="Experten-Videos, Checklisten, Guides und exklusive Materialien erscheinen erst mit sauberer Freigabe. Keine Paywall ohne Abo-Logik." action="Feed ansehen" href="/feed" />
          )}
        </Section>

        <Section id="subscriptions" title="Abonnements" cta="Benefits" href="/benefits">
          <div className="grid gap-3">
            <SignalRow icon={<Star className="h-4 w-4" />} title="Creator Membership" text="Wiederkehrende Creator-Umsaetze werden vorbereitet, aber nicht aus bestehenden Abo-Tabellen zweckentfremdet." />
            <SignalRow icon={<ShieldCheck className="h-4 w-4" />} title="Transparente Gebuehren" text="Provisionen, Featured-Platzierungen und Creator Plus brauchen klare Regeln vor Launch." />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="community" title="Community Programme" cta="Gruppen" href="/business/groups">
          {data.groups.length ? (
            <div className="grid gap-3">
              {data.groups.slice(0, 4).map((group) => (
                <SignalRow key={group.id} icon={<UsersRound className="h-4 w-4" />} title={group.name} text={`${group.memberCount} Mitglieder${group.city ? ` - ${group.city}` : ""}`} href="/business/groups" />
              ))}
            </div>
          ) : (
            <EmptyState title="Creator Communities werden vorbereitet." text="Masterminds, Lernraeume und Workshop-Gruppen koennen spaeter auf bestehender Gruppen-/Chatlogik aufbauen." action="Connect oeffnen" href="/connect" />
          )}
        </Section>

        <Section id="events" title="Creator Events" cta="Events" href="/events">
          <div className="grid gap-3">
            {(data.creatorEvents.length ? data.creatorEvents : data.events).slice(0, 4).map((event) => (
              <SignalRow key={event.id} icon={<PlaySquare className="h-4 w-4" />} title={event.title} text={`${event.city} - ${formatEventDate(event.dateStart)}`} href={`/events/${event.slug}`} />
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        <Section id="business" title="Business Creator" cta="Business" href="/business">
          <div className="grid gap-3">
            <Metric label="Experten-Signale" value={data.counts.businessExperts} />
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title={businessActive ? "Business-Profil aktiv" : "Business-Profil vorbereiten"} text="Business bleibt Netzwerk und Seriositaet; Creator nutzt es fuer Expertise." href="/business" />
          </div>
        </Section>

        <Section id="services" title="Dienstleistungen" cta="Dienstleistungen" href="/local-services">
          <div className="grid gap-3">
            <Metric label="Gepruefte Anbieter" value={data.counts.verifiedProviders} />
            <SignalRow icon={<Wrench className="h-4 w-4" />} title={providerActive ? "Anbieterprofil aktiv" : "Beratung als Auftrag"} text="Coachings und Expertenleistungen koennen spaeter sauber ueber Dienstleistungen laufen." href={providerActive ? "/local-services/company/dashboard" : "/local-services/create"} />
          </div>
        </Section>

        <Section id="benefits" title="Benefits Verbindung" cta="Benefits" href="/benefits">
          <div className="grid gap-3">
            <SignalRow icon={<Sparkles className="h-4 w-4" />} title="Member-only Wissen" text="Rabatte auf Erstcoachings, Webinare oder Creator Events werden nur als echte Benefits angezeigt." href="/benefits" />
            <SignalRow icon={<CalendarDays className="h-4 w-4" />} title="Event + Creator" text="Workshops und Masterclasses bleiben im Event-Hub buchbar." href="/events" />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section id="dashboard" title="Creator Dashboard" cta="Profil" href="/profile">
          <EmptyState
            title="Creator-Dashboard wird vorbereitet."
            text="Profilstatus, Produkte, Coachings, Kurse, Premium Inhalte, Abonnenten, Umsaetze und Auszahlungen brauchen eine eigene sichere Freigabe. Noch keine leeren Admin-Funktionen live."
            action={businessActive ? "Business-Profil oeffnen" : "Profil bearbeiten"}
            href={businessActive ? "/business/profile" : "/profile/edit"}
          />
        </Section>

        <Section id="trust" title="Vertrauen & Qualitaet" cta="Profil" href="/profile">
          <div className="grid gap-3">
            <TrustCard title="Verifizierte Person" text="Creator sollen echte, verifizierte Menschen mit nachvollziehbarer Erfahrung sein." />
            <TrustCard title="Keine Fake-Produkte" text="Keine Produkte, Kurse, Abos oder Verkaeufe werden angezeigt, solange keine sichere Struktur existiert." />
            <TrustCard title="Keine privaten Daten" text="Kaeufer-, Zahlungs-, Kurs-, Chat- und Dienstleistungsdaten bleiben privat." />
          </div>
        </Section>
      </div>

      <Section id="monetization" title="Monetarisierung" cta="Admin" href={data.isAdmin ? "/admin/analytics" : "/benefits"}>
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard title="Digitale Produkte" text="Spaeter Umsatzbeteiligung auf Guides, Templates und Tools, erst nach fertiger Payment-/Downloadlogik." />
          <TrustCard title="Coachings & Kurse" text="Provisionen auf echte Buchungen oder Events, keine falschen Einnahmeversprechen." />
          <TrustCard title="Creator Plus" text="Featured Creator, Abos und Premium Inhalte brauchen klare Kennzeichnung und Admin-Freigabe." />
        </div>
      </Section>

      <Section id="quick-actions" title="Schnellaktionen" cta="Discover" href="/discover">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroButton href="/creator" icon={<Sparkles className="h-4 w-4" />} label="Creator entdecken" />
          <HeroButton href={businessActive ? "/business/profile" : "/business"} icon={<Briefcase className="h-4 w-4" />} label="Als Creator starten" />
          <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Workshops entdecken" />
          <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business Experten" />
          <HeroButton href="/local-services/create" icon={<Wrench className="h-4 w-4" />} label="Dienstleistung anfragen" />
          <HeroButton href="/chat" icon={<MessageCircle className="h-4 w-4" />} label="Nachricht senden" />
          <HeroButton href="/profile/edit" icon={<BadgeCheck className="h-4 w-4" />} label="Profil bearbeiten" />
          <HeroButton href="/benefits" icon={<Sparkles className="h-4 w-4" />} label="Benefits ansehen" />
          {data.isAdmin ? <HeroButton href="/admin/moderation" icon={<ShieldCheck className="h-4 w-4" />} label="Admin Moderation" /> : null}
        </div>
      </Section>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
      <p className="font-display text-3xl text-hm-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{label}</p>
    </div>
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
