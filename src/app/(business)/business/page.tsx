import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Coffee,
  Crown,
  Eye,
  Handshake,
  HeartHandshake,
  Lock,
  MessageCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Wrench,
} from "lucide-react";
import { getBusinessHubData } from "@/features/business/hub-service";

export const dynamic = "force-dynamic";

const moduleLabels: Record<string, string> = {
  business: "Business",
  creator_business: "Creator Business",
  local_services: "Lokale Dienstleistungen",
  ai_marketplace: "KI-Marktplatz",
  eat_restaurant: "Eat Restaurant",
  event_vendor: "Event Anbieter",
  dating_entrepreneur: "Dating Entrepreneur",
};

export default async function BusinessPage() {
  const data = await getBusinessHubData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const business = data.me?.profile;
  const businessActive = Boolean(data.me?.businessEnabled && business);
  const plusActive = business?.tier === "plus" || Boolean(data.subscription?.active);
  const providerActive = data.localMe?.providerProfile?.verificationStatus === "verified";

  if (!data.verified) {
    return (
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
          <p className="hm-label text-hm-business">Business</p>
          <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Verifizierung erforderlich.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-hm-inkSoft sm:text-base">
            Business ist ein verifizierter Bereich. Bitte bestaetige zuerst deine Identitaet, bevor du Networking,
            Jobs, Coffee Chats oder Unternehmensmodule nutzt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <HeroButton href="/verify" icon={<ShieldCheck className="h-4 w-4" />} label="Jetzt verifizieren" />
            <HeroButton href="/settings" icon={<Lock className="h-4 w-4" />} label="Einstellungen" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain shadow-luxury">
        <div className="grid gap-0 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="min-h-80 bg-[radial-gradient(circle_at_24%_20%,rgba(168,133,63,.42),transparent_34%),linear-gradient(135deg,var(--hm-ink),var(--hm-champagne))]" />
          <div className="flex flex-col justify-end p-6 sm:p-10">
            <p className="hm-label text-hm-business">HotMess Business</p>
            <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Chancen aus echten Begegnungen.</h1>
            <p className="mt-5 text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Business buendelt Kontakte, Jobs, Coffee Chats, Gruppen und Anbieter-Module. Der
              Fokus liegt auf wirtschaftlichen Moeglichkeiten aus verifizierten Profilen und echten Events.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <HeroButton href="/business/profile" icon={<Building2 className="h-4 w-4" />} label={businessActive ? "Profil verwalten" : "Business aktivieren"} />
              <HeroButton href="/business/jobs" icon={<Briefcase className="h-4 w-4" />} label="Jobs ansehen" />
              <HeroButton href="/business/coffee" icon={<Coffee className="h-4 w-4" />} label="Coffee Chat" />
              <HeroButton href="/connect" icon={<Handshake className="h-4 w-4" />} label="Connect oeffnen" />
            </div>
          </div>
        </div>
      </section>

      <Section title="Business-Profil" text="Status, Sichtbarkeit und Vollstaendigkeit deines beruflichen Auftritts." href="/business/profile" cta="Profil">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-card border border-hm-border bg-hm-ivory p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="hm-label text-hm-business">{businessActive ? "Aktiv" : "Noch nicht aktiv"}</p>
                <h2 className="mt-3 font-display text-3xl text-hm-ink">{business?.headline ?? "Business-Profil anlegen"}</h2>
                <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
                  {businessActive
                    ? `${business?.company ?? "Unternehmen offen"} - ${business?.industry ?? "Branche offen"}`
                    : "Lege ein getrenntes Business-Profil an. Private Social-, Dating- und Business-Daten bleiben getrennt."}
                </p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-hm-gold/10 text-hm-business">
                {businessActive ? <BadgeCheck className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
              </span>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-bold text-hm-inkSoft">
                <span>Profilstaerke</span>
                <span>{data.profileCompletion}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-hm-champagne">
                <div className="h-2 rounded-full bg-hm-business" style={{ width: `${data.profileCompletion}%` }} />
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard icon={<UsersRound className="h-5 w-5" />} title="Vorschlaege" value={`${data.suggestions.length}`} text="Komplementaere Kontakte" href="/business" />
            <MetricCard icon={<Handshake className="h-5 w-5" />} title="Matches" value={`${data.matches.length}`} text="Beidseitiges Interesse" href="/business/matches" />
            <MetricCard icon={<Coffee className="h-5 w-5" />} title="Coffee Chats" value={`${data.counts.coffeeChats}`} text="Vorgeschlagen oder bestaetigt" href="/business/coffee" />
            <MetricCard icon={<Eye className="h-5 w-5" />} title="Profilbesuche" value={`${data.counts.profileViews}`} text={plusActive ? "Business Plus sichtbar" : "Plus vorbereitet"} href="/business/premium" />
          </div>
        </div>
      </Section>

      <Section title="Uebersicht" text="Die wichtigsten Business-Flaechen bleiben von hier aus erreichbar." href="/connect" cta="Connect">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={<Briefcase className="h-5 w-5" />} title="Offene Jobs" value={`${data.jobs.length}`} text={`${data.counts.jobApplications} Bewerbungen von dir`} href="/business/jobs" />
          <MetricCard icon={<Building2 className="h-5 w-5" />} title="Eigene Inserate" value={`${data.counts.ownJobs}`} text="Business Plus oder Einzelinserat" href="/business/jobs/manage" />
          <MetricCard icon={<UsersRound className="h-5 w-5" />} title="Gruppen" value={`${data.counts.groups}`} text="Branchen- und Stadtgruppen" href="/business/groups" />
          <MetricCard icon={<Star className="h-5 w-5" />} title="Empfehlungen" value={`${data.counts.recommendations}`} text="Freigegebene Reputation" href="/business/profile" />
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section title="Unternehmer-Netzwerk" text="Tagesvorschlaege nach Ziel, Branche, Standort und Event-Kontext." href="/business" cta="Alle">
          {data.suggestions.length ? (
            <div className="grid gap-3">
              {data.suggestions.map((person) => (
                <MiniRow
                  key={person.userId}
                  href={person.username ? `/u/${person.username}` : "/business/matches"}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title={person.name}
                  text={`${person.headline} - ${person.matchReason}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState text={businessActive ? "Noch keine passenden Vorschlaege. Ergaenze Ziele, Skills und Branche im Business-Profil." : "Aktiviere dein Business-Profil, damit Vorschlaege berechnet werden koennen."} href="/business/profile" cta="Profil bearbeiten" />
          )}
        </Section>

        <Section title="Business Matches" text="Beidseitiges Interesse oeffnet den normalen HotMess Chat." href="/business/matches" cta="Matches">
          <div className="grid gap-3">
            {data.matches.map((match) => (
              <MiniRow key={match.id} href={match.conversationId ? `/chat/${match.conversationId}` : "/business/matches"} icon={<Handshake className="h-4 w-4" />} title={match.person.name} text={match.matchReason ?? match.person.matchReason} />
            ))}
            {!data.matches.length ? <EmptyState text="Noch keine Business Matches. Starte mit passenden Vorschlaegen oder Event-Networking." href="/business" cta="Vorschlaege ansehen" /> : null}
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Coffee Chats" text="Kurze berufliche Gespraeche vor Ort, per Video oder rund um Events." href="/business/coffee" cta="Planen">
          <div className="grid gap-3">
            <MiniRow href="/business/coffee" icon={<Coffee className="h-4 w-4" />} title="Coffee Chat vorschlagen" text="Bis zu drei Zeiten, Ort oder Video-Link" />
            <MiniRow href="/business/coffee" icon={<CalendarDays className="h-4 w-4" />} title="Bestaetigte Termine" text={`${data.counts.coffeeChats} aktuell vorgeschlagen oder bestaetigt`} />
            <MiniRow href="/business/premium" icon={<Crown className="h-4 w-4" />} title="Kalender-Export" text="Business Plus vorbereitet" />
          </div>
        </Section>

        <Section title="Unternehmensverzeichnis" text="Verifizierte Firmen, Anbieter und Business-Profile werden klar getrennt." href="/local-services" cta="Services">
          <div className="grid gap-3">
            <MiniRow href="/local-services" icon={<Search className="h-4 w-4" />} title="Dienstleister suchen" text="Kundensicht ohne Leadkosten oder Anbieterpreise" />
            <MiniRow href="/local-services/company/dashboard" icon={<Wrench className="h-4 w-4" />} title="Anbieterbereich" text={providerActive ? "Lokale Dienstleistungen aktiv" : "Nur mit verifiziertem Firmenkonto"} />
            <MiniRow href="/settings" icon={<ShieldCheck className="h-4 w-4" />} title="Modulfreigaben" text={data.modules.length ? data.modules.map((item: string) => moduleLabels[item] ?? item).join(", ") : "Noch keine Zusatzmodule aktiv"} />
          </div>
        </Section>
      </div>

      <Section title="Jobs & Bewerbungen" text="Szene-Jobs, Event-Personal und Bewerbungen via HotMess Chat." href="/business/jobs" cta="Job-Board">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(data.featuredJobs.length ? data.featuredJobs : data.jobs).slice(0, 6).map((job) => (
            <MiniRow
              key={job.id}
              href={`/business/jobs/${job.id}`}
              icon={<Briefcase className="h-4 w-4" />}
              title={job.title}
              text={`${job.company ?? "Unternehmen"} - ${job.city ?? (job.isRemote ? "Remote" : "Ort offen")}`}
            />
          ))}
          {!data.jobs.length ? <EmptyState text="Noch keine offenen Jobs. Sobald Inserate vorhanden sind, erscheinen sie hier." href="/business/jobs" cta="Jobs ansehen" /> : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <PillLink href="/business/jobs/manage" icon={<PlusCircle className="h-4 w-4" />} label="Job inserieren" />
          <PillLink href="/business/jobs" icon={<Search className="h-4 w-4" />} label={`${data.counts.savedJobs} gespeicherte Jobs`} />
          <PillLink href="/business/jobs" icon={<Sparkles className="h-4 w-4" />} label={`${data.counts.jobAlerts} Job-Alerts`} />
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Business Events" text="Der HotMess-USP: Business-Kontext entsteht aus echten Events." href="/events" cta="Events">
          <div className="grid gap-3">
            {data.eventConnections.map((event) => (
              <MiniRow key={event.href + event.title} href={event.href} icon={<CalendarDays className="h-4 w-4" />} title={event.title} text={event.text} />
            ))}
            {data.eventSuggestions.map((person) => (
              <MiniRow key={person.userId} href={person.username ? `/u/${person.username}` : "/business/matches"} icon={<UsersRound className="h-4 w-4" />} title={person.name} text={person.sharedEvent ? `Auch bei ${person.sharedEvent.title}` : person.matchReason} />
            ))}
          </div>
        </Section>

        <Section title="Business Gruppen" text="Branchen- und Stadtgruppen nutzen den normalen HotMess Gruppenchat." href="/business/groups" cta="Gruppen">
          <div className="grid gap-3">
            {data.groups.map((group) => (
              <MiniRow key={group.id} href="/business/groups" icon={<UsersRound className="h-4 w-4" />} title={group.name} text={`${group.industry ?? "Branche offen"} - ${group.city ?? "ueberregional"} - ${group.memberCount} Mitglieder`} />
            ))}
            {!data.groups.length ? <EmptyState text="Noch keine oeffentlichen Business-Gruppen vorhanden." href="/business/groups" cta="Gruppe erstellen" /> : null}
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.52fr_0.48fr]">
        <Section title="Partnerschaften" text="Kooperationen, Sponsoring und Event-Vendor-Moeglichkeiten vorbereiten." href="/events" cta="Events">
          <div className="grid gap-3">
            <MiniRow href="/events" icon={<Handshake className="h-4 w-4" />} title="Event-Kooperationen" text="Business-Kontakte mit echten Event-Anlaessen verbinden" />
            <MiniRow href="/local-services" icon={<Wrench className="h-4 w-4" />} title="B2B Dienstleistungen" text="Als Unternehmen Leistungen anfragen oder anbieten" />
            <MiniRow href="/admin/partners" icon={<Building2 className="h-4 w-4" />} title="Partner-Struktur" text="Admin verwaltet Hotels, Clubs und Sponsoren" />
          </div>
        </Section>

        <Section title="Services & B2B-Auftraege" text="Unternehmen koennen Anbieter sein und gleichzeitig Kunde anderer Unternehmen." href="/local-services" cta="Lokale Services">
          <div className="grid gap-3">
            <MiniRow href="/local-services/create" icon={<PlusCircle className="h-4 w-4" />} title="Auftrag anfragen" text="Privat, Firmenauftrag oder Subunternehmerauftrag" />
            <MiniRow href="/local-services/company/activate" icon={<Building2 className="h-4 w-4" />} title="Anbieter aktivieren" text="Nur passende Kategorien zum Firmenprofil" />
            <MiniRow href="/local-services/company/dashboard" icon={<BarChart3 className="h-4 w-4" />} title="Anbieter-Dashboard" text={providerActive ? "Leads, Angebote und Auftraege" : "Nach Freigabe sichtbar"} />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Business Plus" text="Premium-Funktionen sind sichtbar vorbereitet und serverseitig gegated." href="/business/premium" cta="Plus">
          <div className="grid gap-3">
            <MiniRow href="/business/premium" icon={<Crown className="h-4 w-4" />} title={plusActive ? "Business Plus aktiv" : "Business Plus vorbereiten"} text="Priority, Jobs inserieren, Gruppen erstellen, Analytics" />
            <MiniRow href="/business/jobs/manage" icon={<Briefcase className="h-4 w-4" />} title="Jobs ausschreiben" text="Plus oder Einzelinserat" />
            <MiniRow href="/business/groups" icon={<UsersRound className="h-4 w-4" />} title="Gruppen erstellen" text="Plus-Funktion fuer Branchenraeume" />
          </div>
        </Section>

        <Section title="Reputation & Vertrauen" text="Business soll serioes bleiben: verifiziert, empfohlen und meldbar." href="/business/profile" cta="Profil">
          <div className="grid gap-3">
            <MiniRow href="/verify" icon={<ShieldCheck className="h-4 w-4" />} title="Identitaet verifiziert" text="Privatprofil ist Voraussetzung fuer Business" />
            <MiniRow href="/business/profile" icon={<BadgeCheck className="h-4 w-4" />} title="Unternehmensstatus" text={business?.is_verified_business ? "Unternehmer-Verifizierung aktiv" : "Optionaler Firmennachweis vorbereitet"} />
            <MiniRow href="/business/profile" icon={<Star className="h-4 w-4" />} title="Empfehlungen" text={`${data.counts.recommendations} freigegeben`} />
            <MiniRow href="/settings/support" icon={<Lock className="h-4 w-4" />} title="Melden & Sicherheit" text="Business Reports laufen in die Admin-Moderation" />
          </div>
        </Section>
      </div>

      <Section title="Schnellaktionen" href="/business/profile" cta="Business-Profil">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <HeroButton href="/business/profile" icon={<Building2 className="h-4 w-4" />} label="Profil bearbeiten" />
          <HeroButton href="/business/matches" icon={<Handshake className="h-4 w-4" />} label="Matches ansehen" />
          <HeroButton href="/business/coffee" icon={<Coffee className="h-4 w-4" />} label="Coffee Chat planen" />
          <HeroButton href="/business/jobs" icon={<Briefcase className="h-4 w-4" />} label="Jobs oeffnen" />
          <HeroButton href="/business/jobs/manage" icon={<PlusCircle className="h-4 w-4" />} label="Job erstellen" />
          <HeroButton href="/business/groups" icon={<UsersRound className="h-4 w-4" />} label="Gruppen" />
          <HeroButton href="/local-services" icon={<Wrench className="h-4 w-4" />} label="Lokale Services" />
          <HeroButton href="/connect" icon={<HeartHandshake className="h-4 w-4" />} label="Connect" />
        </div>
      </Section>
    </main>
  );
}

function Section({ title, text, href, cta, children }: { title: string; text?: string; href: string; cta: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
          {text ? <p className="mt-2 max-w-2xl text-sm leading-6 text-hm-inkSoft">{text}</p> : null}
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-business">
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
      <ArrowRight className="h-4 w-4 text-hm-business" />
    </Link>
  );
}

function MetricCard({ href, icon, title, value, text }: { href: string; icon: ReactNode; title: string; value: string; text: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-business">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{value}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function MiniRow({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hm-porcelain text-hm-business">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{text}</span>
      </span>
    </Link>
  );
}

function PillLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center gap-2 rounded-pill border border-hm-gold/25 bg-hm-ivory px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-hm-ink transition hover:bg-hm-champagne">
      {icon}
      {label}
    </Link>
  );
}

function EmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-business">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
