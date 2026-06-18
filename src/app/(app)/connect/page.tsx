import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Coffee,
  HeartHandshake,
  Lock,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";
import { getConnectData } from "@/features/connect/service";

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const data = await getConnectData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const isAdmin = data.profile?.role === "admin";
  const isProvider = data.localMe?.providerProfile?.verificationStatus === "verified";

  if (!data.verified) {
    return (
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
          <p className="hm-label text-hm-goldDeep">Connect</p>
          <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Verifizierung erforderlich.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-hm-inkSoft sm:text-base">
            Auf HotMess verbinden sich nur verifizierte Menschen. Bitte bestaetige deine Identitaet, bevor du Kontakte,
            Chats, Dating, Business oder Event-Verbindungen nutzt.
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
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-80 bg-[radial-gradient(circle_at_22%_20%,rgba(198,163,93,.34),transparent_32%),linear-gradient(135deg,var(--hm-ink),var(--hm-champagne))]" />
          <div className="flex flex-col justify-end p-6 sm:p-10">
            <p className="hm-label text-hm-goldDeep">Connect</p>
            <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Verbinde dich mit echten Menschen.</h1>
            <p className="mt-5 text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Connect buendelt Freunde, Nachrichten, Dating, Business, Events und sichere
              Kontaktwege. Nicht endlos liken, sondern sinnvolle Verbindungen aufbauen.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <HeroButton href="/explore/people" icon={<Search className="h-4 w-4" />} label="Menschen entdecken" />
              <HeroButton href="/chat" icon={<Send className="h-4 w-4" />} label="Chat oeffnen" />
              <HeroButton href="/dating" icon={<HeartHandshake className="h-4 w-4" />} label="Dating oeffnen" />
              <HeroButton href="/friends" icon={<UsersRound className="h-4 w-4" />} label="Freunde anzeigen" />
            </div>
          </div>
        </div>
      </section>

      <Section title="Connect-Uebersicht" text="Jede Kachel fuehrt in einen bestehenden Bereich. Dating, Business und private Kontakte bleiben klar getrennt." href="/discover" cta="Discover">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <OverviewCard href="/friends" icon={<UsersRound className="h-5 w-5" />} title="Freunde" value={`${data.followStats.followers} Follower`} text={`${data.followStats.following} gefolgt - ${data.followStats.followRequests} offene Anfragen`} />
          <OverviewCard href="/chat" icon={<MessageCircle className="h-5 w-5" />} title="Chat" value={`${data.unreadMessages} ungelesen`} text={`${data.chatRequests} Chat-Anfragen - ${data.conversations.length} letzte Gespraeche`} />
          <OverviewCard href="/dating" icon={<HeartHandshake className="h-5 w-5" />} title="Dating" value={data.datingMe?.datingEnabled ? "Aktiv" : "Aus"} text={`${data.datingMatches.length} Matches - ${data.datingLikes.length} Likes`} />
          <OverviewCard href="/events" icon={<CalendarDays className="h-5 w-5" />} title="Event Connect" value={`${data.eventConnections.length} Anlaesse`} text="Menschen rund um echte Events kennenlernen" />
          <OverviewCard href="/business" icon={<Briefcase className="h-5 w-5" />} title="Business Connect" value={data.businessMe?.businessEnabled ? "Aktiv" : "Aus"} text={`${data.businessMatches.length} Matches - ${data.coffeeChatCount} Coffee Chats`} />
          <OverviewCard href="/settings/privacy" icon={<ShieldCheck className="h-5 w-5" />} title="Sicherheit" value="Verifiziert" text="Privatsphaere, Nachrichtenregeln und Blockieren" />
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section title="Meine Beziehungen" text="Bestehende Kontakte und echte Verbindungssignale." href="/friends" cta="Freunde">
          <div className="grid gap-3">
            <MiniRow href="/friends" icon={<UsersRound className="h-4 w-4" />} title="Follower & Gefolgt" text={`${data.followStats.followers} Follower - ${data.followStats.following} gefolgt`} />
            <MiniRow href="/friends/requests" icon={<Bell className="h-4 w-4" />} title="Freundesanfragen" text={data.followStats.followRequests ? `${data.followStats.followRequests} offen` : "Aktuell keine offenen Anfragen"} />
            <MiniRow href="/settings/privacy" icon={<Lock className="h-4 w-4" />} title="Enge Freunde & Privatsphaere" text={`${data.followStats.closeFriends} enge Kontakte - Sichtbarkeit steuern`} />
          </div>
        </Section>

        <Section title="Kontaktanfragen" text="Private, Chat-, Dating- und Business-Anfragen bleiben getrennt." href="/friends/requests" cta="Anfragen">
          <div className="grid gap-3">
            <MiniRow href="/friends/requests" icon={<UsersRound className="h-4 w-4" />} title="Private Anfragen" text={data.followStats.followRequests ? `${data.followStats.followRequests} offen` : "Keine offenen Freundesanfragen"} />
            <MiniRow href="/chat/requests" icon={<MessageCircle className="h-4 w-4" />} title="Chat-Anfragen" text={data.chatRequests ? `${data.chatRequests} offen` : "Keine Chat-Anfragen"} />
            <MiniRow href="/dating/likes" icon={<HeartHandshake className="h-4 w-4" />} title="Dating Likes" text={data.datingMe?.datingEnabled ? `${data.datingLikes.length} sichtbar im Dating-Bereich` : "Dating ist getrennt und noch aus"} />
            <MiniRow href="/business/matches" icon={<Briefcase className="h-4 w-4" />} title="Business Matches" text={data.businessMe?.businessEnabled ? `${data.businessMatches.length} Verbindungen` : "Business Connect optional aktivieren"} />
          </div>
        </Section>
      </div>

      <Section title="Chat & Nachrichten" text="Chat ist dein Beziehungswerkzeug: Nachrichten, Gruppen, Notes und Anfragen." href="/chat" cta="Inbox">
        {data.conversations.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.conversations.map((conversation) => (
              <MiniRow
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                icon={<MessageCircle className="h-4 w-4" />}
                title={conversation.name}
                text={`${conversation.preview} - ${conversation.timeLabel || "gerade"}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Noch keine Gespraeche. Starte eine Nachricht oder entdecke Menschen, die zu dir passen." href="/chat/new" cta="Neue Nachricht" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Dating & Matches" text="Dating bleibt privat getrennt und wird nur bei Opt-in sichtbar." href="/dating" cta="Dating">
          {data.datingMe?.datingEnabled ? (
            <div className="grid gap-3">
              {data.datingMatches.map((match) => (
                <MiniRow key={match.id} href={match.conversationId ? `/chat/${match.conversationId}` : "/dating/matches"} icon={<HeartHandshake className="h-4 w-4" />} title={match.person.displayName} text={match.matchedViaEvent ? `Match ueber ${match.matchedViaEvent.title}` : "Dating Match"} />
              ))}
              {!data.datingMatches.length ? <EmptyState text="Noch keine Matches. Nutze Dating, wenn du Menschen im getrennten Dating-Modus kennenlernen moechtest." href="/dating" cta="Dating oeffnen" /> : null}
            </div>
          ) : (
            <EmptyState text="Aktiviere Dating, wenn du Menschen im Dating-Modus kennenlernen moechtest. Dein Dating-Profil bleibt getrennt." href="/dating" cta="Dating aktivieren" />
          )}
        </Section>

        <Section title="Business Connect" text="Geschaeftliche Beziehungen ohne LinkedIn-Laerm: Matches, Coffee Chats und Gruppen." href="/business" cta="Business">
          {data.businessMe?.businessEnabled ? (
            <div className="grid gap-3">
              {data.businessMatches.map((match) => (
                <MiniRow key={match.id} href={match.conversationId ? `/chat/${match.conversationId}` : "/business/matches"} icon={<Briefcase className="h-4 w-4" />} title={match.person.name} text={match.matchReason ?? match.person.matchReason} />
              ))}
              <MiniRow href="/business/coffee" icon={<Coffee className="h-4 w-4" />} title="Coffee Chats" text={`${data.coffeeChatCount} vorgeschlagen oder bestaetigt`} />
              <MiniRow href="/business/groups" icon={<UsersRound className="h-4 w-4" />} title="Business Gruppen" text={`${data.groupCount} Gruppenmitgliedschaften`} />
            </div>
          ) : (
            <EmptyState text="Aktiviere dein Business-Profil, um Coffee Chats, Gruppen und Geschaeftskontakte zu nutzen." href="/business" cta="Business aktivieren" />
          )}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Event Connect" text="Events sind der Anlass. Connect macht daraus Beziehungen." href="/events" cta="Events">
          <div className="grid gap-3">
            {data.eventConnections.map((event) => (
              <MiniRow key={`${event.href}-${event.title}`} href={event.href} icon={<CalendarDays className="h-4 w-4" />} title={event.title} text={event.text} />
            ))}
            {!data.eventConnections.length ? <EmptyState text="Sobald du Events besuchst, kannst du hier passende Kontakte und gemeinsame Teilnehmer entdecken." href="/events" cta="Events entdecken" /> : null}
          </div>
        </Section>

        <Section title="Gruppen & Communities" text="Keine lauten Foren: Raeume rund um Business, Events und echte Interessen." href="/business/groups" cta="Gruppen">
          <div className="grid gap-3">
            <MiniRow href="/business/groups" icon={<UsersRound className="h-4 w-4" />} title="Business Gruppen" text={`${data.groupCount} Gruppenmitgliedschaften`} />
            <MiniRow href="/chat" icon={<MessageCircle className="h-4 w-4" />} title="Gruppen-Chats" text="Gruppenkommunikation laeuft ueber den HotMess Chat" />
            <MiniRow href="/events" icon={<CalendarDays className="h-4 w-4" />} title="Event-Gruppen" text="Event-Chats bleiben ticket- und eventgebunden" />
          </div>
        </Section>
      </div>

      <Section title="People Discovery" text="Neue verifizierte Menschen entdecken. Dating bleibt getrennt, Business bleibt klar gekennzeichnet." href="/explore/people" cta="Alle ansehen">
        {data.people.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.people.map((person) => (
              <MiniRow key={person.id} href={`/u/${person.username}`} icon={<CheckCircle2 className="h-4 w-4" />} title={person.name} text={person.city ? `Verifiziert - ${person.city}` : "Verifiziertes Mitglied"} />
            ))}
          </div>
        ) : (
          <EmptyState text="Du hast noch keine Vorschlaege. Entdecke verifizierte Mitglieder und baue dein Netzwerk auf." href="/explore/people" cta="Menschen entdecken" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Vertrauen & Sicherheit" text="Connect ist nur wertvoll, wenn es sicher bleibt." href="/settings/privacy" cta="Privatsphaere">
          <div className="grid gap-3">
            <MiniRow href="/verify" icon={<ShieldCheck className="h-4 w-4" />} title="Verifizierte Menschen" text="Kein aktiver Zugang ohne Identitaetspruefung" />
            <MiniRow href="/settings/messages" icon={<MessageCircle className="h-4 w-4" />} title="Nachrichten steuern" text="Lege fest, wer dich kontaktieren darf" />
            <MiniRow href="/settings/security" icon={<Lock className="h-4 w-4" />} title="Blockieren & Sicherheit" text="Blockierte Nutzer werden nicht empfohlen" />
            <MiniRow href="/settings/support" icon={<Bell className="h-4 w-4" />} title="Melden & Support" text="Problematische Kontakte melden" />
          </div>
        </Section>

        <Section title="Schnellaktionen" href="/profile" cta="Profil">
          <div className="grid gap-3">
            <HeroButton href="/explore/people" icon={<Search className="h-4 w-4" />} label="Menschen entdecken" />
            <HeroButton href="/friends" icon={<UsersRound className="h-4 w-4" />} label="Freunde anzeigen" />
            <HeroButton href="/chat/new" icon={<Send className="h-4 w-4" />} label="Neue Nachricht" />
            <HeroButton href="/dating/matches" icon={<HeartHandshake className="h-4 w-4" />} label="Matches ansehen" />
            <HeroButton href="/business/coffee" icon={<Coffee className="h-4 w-4" />} label="Coffee Chat" />
            <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events entdecken" />
            {isProvider ? <HeroButton href="/local-services/company/dashboard" icon={<Wrench className="h-4 w-4" />} label="Anbieter-Kontakte" /> : null}
            {isAdmin ? <HeroButton href="/admin/moderation" icon={<Sparkles className="h-4 w-4" />} label="Moderation" /> : null}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, text, href, cta, children }: { title: string; text?: string; href: string; cta: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
          {text ? <p className="mt-2 max-w-2xl text-sm leading-6 text-hm-inkSoft">{text}</p> : null}
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function HeroButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

function OverviewCard({ href, icon, title, value, text }: { href: string; icon: React.ReactNode; title: string; value: string; text: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{value}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function MiniRow({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hm-porcelain text-hm-goldDeep">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{text}</span>
      </span>
    </Link>
  );
}

function EmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
