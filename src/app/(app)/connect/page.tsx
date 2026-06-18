import type { ReactNode } from "react";
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
  PlusCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
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
  const isScanner = data.profile?.role === "scanner" || data.profile?.role === "admin";
  const isProvider = data.localMe?.providerProfile?.verificationStatus === "verified";
  const datingActive = Boolean(data.datingMe?.datingEnabled);
  const businessActive = Boolean(data.businessMe?.businessEnabled);
  const unreadTotal = data.unreadMessages + data.chatRequests + data.followStats.followRequests;

  if (!data.verified) {
    return (
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
          <p className="hm-label text-hm-goldDeep">Connect</p>
          <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Verifizierung erforderlich.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-hm-inkSoft sm:text-base">
            Connect ist nur fuer verifizierte Mitglieder aktiv. Bitte bestaetige deine Identitaet, dann werden Chat,
            Freunde, Dating, Business, Events und Anbieter-Kontakte freigeschaltet.
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
          <div className="min-h-80 bg-[radial-gradient(circle_at_22%_20%,rgba(198,163,93,.34),transparent_32%),linear-gradient(135deg,var(--hm-ink),var(--hm-champagne))]" />
          <div className="flex flex-col justify-end p-6 sm:p-10">
            <p className="hm-label text-hm-goldDeep">Connect Center</p>
            <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">Alle Verbindungen an einem Ort.</h1>
            <p className="mt-5 text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Hier bedienst du den vollen Connect-Kreis: Menschen finden, schreiben, Anfragen
              bearbeiten, Dating und Business getrennt nutzen, Event-Kontakte aufbauen und Services verbinden.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <HeroButton href="/chat" icon={<Send className="h-4 w-4" />} label="Inbox oeffnen" />
              <HeroButton href="/explore/people" icon={<Search className="h-4 w-4" />} label="Menschen entdecken" />
              <HeroButton href="/dating" icon={<HeartHandshake className="h-4 w-4" />} label="Dating bedienen" />
              <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business bedienen" />
            </div>
          </div>
        </div>
      </section>

      <Section title="Live-Status" text="Die wichtigsten Signale aus Chat, Freunden, Dating, Business, Events und Services." href="/notifications" cta="Mitteilungen">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatusCard href="/chat" icon={<MessageCircle className="h-5 w-5" />} title="Ungelesen" value={`${data.unreadMessages}`} text={`${data.chatRequests} Chat-Anfragen`} hot={data.unreadMessages > 0} />
          <StatusCard href="/friends/requests" icon={<UsersRound className="h-5 w-5" />} title="Freunde" value={`${data.followStats.followers}`} text={`${data.followStats.followRequests} offene Anfragen`} hot={data.followStats.followRequests > 0} />
          <StatusCard href="/dating" icon={<HeartHandshake className="h-5 w-5" />} title="Dating" value={datingActive ? "Aktiv" : "Aus"} text={`${data.datingMatches.length} Matches - ${data.datingLikes.length} Likes`} hot={datingActive && data.datingLikes.length > 0} />
          <StatusCard href="/business" icon={<Briefcase className="h-5 w-5" />} title="Business" value={businessActive ? "Aktiv" : "Aus"} text={`${data.businessMatches.length} Matches - ${data.coffeeChatCount} Coffee Chats`} hot={businessActive && data.businessMatches.length > 0} />
        </div>
      </Section>

      <Section title="Bedienzentrale" text="Jede Kachel fuehrt direkt zur passenden Funktion. Keine Sackgasse, immer zurueck ueber Bottom-Nav." href="/connect" cta={`${unreadTotal} Signale`}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard href="/chat" icon={<MessageCircle className="h-5 w-5" />} title="Nachrichten" text="Inbox, Notes, Requests, Gruppen und Event-Chats." label="Chat" />
          <ActionCard href="/chat/new" icon={<PlusCircle className="h-5 w-5" />} title="Neue Nachricht" text="Direktchat oder Gruppe starten." label="Starten" />
          <ActionCard href="/explore/people" icon={<Search className="h-5 w-5" />} title="Personen entdecken" text="Verifizierte Mitglieder und Vorschlaege." label="Social" />
          <ActionCard href="/friends" icon={<UsersRound className="h-5 w-5" />} title="Freunde" text="Follower, Gefolgt, enge Freunde und Anfragen." label="Privat" />
          <ActionCard href="/dating" icon={<HeartHandshake className="h-5 w-5" />} title="Dating" text="Opt-in, Likes, Matches und Event-Dating." label={datingActive ? "Aktiv" : "Opt-in"} />
          <ActionCard href="/business" icon={<Briefcase className="h-5 w-5" />} title="Business" text="Matches, Coffee Chats, Jobs und Gruppen." label={businessActive ? "Aktiv" : "Opt-in"} />
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section title="Inbox & Notes" text="Alles, was dich sofort zurueck in Gespraeche zieht." href="/chat" cta="Inbox">
          <div className="grid gap-3">
            <MiniRow href="/chat" icon={<MessageCircle className="h-4 w-4" />} title="Posteingang" text={`${data.conversations.length} letzte Gespraeche - ${data.unreadMessages} ungelesen`} />
            <MiniRow href="/chat/requests" icon={<Bell className="h-4 w-4" />} title="Anfragen" text={data.chatRequests ? `${data.chatRequests} Chat-Anfragen offen` : "Keine offenen Chat-Anfragen"} />
            <MiniRow href="/chat/new" icon={<Send className="h-4 w-4" />} title="Neue Nachricht" text="Direktchat oder Gruppe erstellen" />
            {data.notes.length ? (
              data.notes.slice(0, 3).map((note) => (
                <MiniRow key={`${note.user.id}-${note.createdAt}`} href="/chat" icon={<Sparkles className="h-4 w-4" />} title={note.mine ? "Deine Notiz" : note.user.name} text={note.text} />
              ))
            ) : (
              <MiniRow href="/chat" icon={<Sparkles className="h-4 w-4" />} title="Notes" text="Noch keine aktiven 24h-Notizen" />
            )}
          </div>
        </Section>

        <Section title="Beziehungen & Anfragen" text="Private Kontakte bleiben getrennt von Dating und Business." href="/friends" cta="Freunde">
          <div className="grid gap-3">
            <MiniRow href="/friends" icon={<UsersRound className="h-4 w-4" />} title="Follower & Gefolgt" text={`${data.followStats.followers} Follower - ${data.followStats.following} gefolgt`} />
            <MiniRow href="/friends/requests" icon={<Bell className="h-4 w-4" />} title="Freundesanfragen" text={data.followStats.followRequests ? `${data.followStats.followRequests} offen` : "Keine offenen Anfragen"} />
            <MiniRow href="/settings/privacy" icon={<Lock className="h-4 w-4" />} title="Privatsphaere" text={`${data.followStats.closeFriends} enge Freunde - Sichtbarkeit steuern`} />
            <MiniRow href="/explore/people" icon={<UserRound className="h-4 w-4" />} title="Neue Kontakte" text={`${data.people.length} Vorschlaege aus Discover`} />
          </div>
        </Section>
      </div>

      <Section title="Aktuelle Gespraeche" text="Direkter Einstieg in laufende Chats. Lesen aktualisiert den Badge live." href="/chat" cta="Alle Chats">
        {data.conversations.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.conversations.map((conversation) => (
              <MiniRow
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                icon={conversation.isEventChat ? <CalendarDays className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                title={conversation.name}
                text={`${conversation.preview} - ${conversation.timeLabel || "gerade"}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Noch keine Gespraeche. Starte eine Nachricht, entdecke Menschen oder nutze Event- und Business-Kontexte." href="/chat/new" cta="Neue Nachricht" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Dating bedienen" text="Dating ist getrennt, privat und nur per Opt-in aktiv." href="/dating" cta="Dating">
          {datingActive ? (
            <div className="grid gap-3">
              <MiniRow href="/dating" icon={<HeartHandshake className="h-4 w-4" />} title="Swipe Stack" text="Karten, SuperLike, Rewind und Event-Filter" />
              <MiniRow href="/dating/likes" icon={<Bell className="h-4 w-4" />} title="Wer mag dich" text={`${data.datingLikes.length} Likes oder SuperLikes`} />
              <MiniRow href="/dating/matches" icon={<MessageCircle className="h-4 w-4" />} title="Matches" text={`${data.datingMatches.length} aktive Matches`} />
              <MiniRow href="/dating/profile" icon={<UserRound className="h-4 w-4" />} title="Dating-Profil" text="Fotos, Bio, Interessen und Filter verwalten" />
            </div>
          ) : (
            <EmptyState text="Dating ist aus. Aktiviere es nur, wenn du den getrennten Dating-Modus nutzen moechtest." href="/dating" cta="Dating aktivieren" />
          )}
        </Section>

        <Section title="Business bedienen" text="Geschaeftliche Kontakte, Jobs und Coffee Chats ohne Vermischung mit Dating." href="/business" cta="Business">
          {businessActive ? (
            <div className="grid gap-3">
              <MiniRow href="/business" icon={<Briefcase className="h-4 w-4" />} title="Business Hub" text={`${data.businessSuggestions.length} passende Vorschlaege`} />
              <MiniRow href="/business/matches" icon={<HandshakeIcon />} title="Business Matches" text={`${data.businessMatches.length} Verbindungen`} />
              <MiniRow href="/business/coffee" icon={<Coffee className="h-4 w-4" />} title="Coffee Chats" text={`${data.coffeeChatCount} vorgeschlagen oder bestaetigt`} />
              <MiniRow href="/business/groups" icon={<UsersRound className="h-4 w-4" />} title="Gruppen" text={`${data.groupCount} Gruppenmitgliedschaften`} />
            </div>
          ) : (
            <EmptyState text="Business ist aus. Aktiviere es fuer Networking, Jobs, Gruppen und Anbieter-Module." href="/business" cta="Business aktivieren" />
          )}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Event Connect" text="Events sind der reale Anlass fuer Kontakte." href="/events" cta="Events">
          <div className="grid gap-3">
            {data.eventConnections.map((event) => (
              <MiniRow key={`${event.href}-${event.title}`} href={event.href} icon={<CalendarDays className="h-4 w-4" />} title={event.title} text={event.text} />
            ))}
            <MiniRow href="/tickets" icon={<Ticket className="h-4 w-4" />} title="Meine Tickets" text={`${data.tickets.length} aktuelle Ticket-Kontexte`} />
            {!data.eventConnections.length ? <EmptyState text="Sobald du Events besuchst, erscheinen hier Event-Kontakte und Event-Chats." href="/events" cta="Events entdecken" /> : null}
          </div>
        </Section>

        <Section title="Services & Anbieter" text="Kundensicht und Anbieterbereich bleiben sauber getrennt." href="/local-services" cta="Dienste">
          <div className="grid gap-3">
            <MiniRow href="/local-services" icon={<Wrench className="h-4 w-4" />} title="Dienstleistung suchen" text="Als Kunde Anfrage erstellen und Angebote erhalten" />
            <MiniRow href="/local-services/create" icon={<PlusCircle className="h-4 w-4" />} title="Auftrag erstellen" text="Privat, Firma oder Subunternehmerauftrag" />
            <MiniRow href="/local-services/company/dashboard" icon={<Briefcase className="h-4 w-4" />} title="Anbieter-Dashboard" text={isProvider ? "Leads und Angebote bearbeiten" : "Nur mit verifiziertem Firmenkonto"} />
            <MiniRow href="/settings" icon={<ShieldCheck className="h-4 w-4" />} title="Modulstatus" text={data.localMe?.businessProfile?.moduleActive ? "Lokale Dienstleistungen freigeschaltet" : "Modulfreigabe offen"} />
          </div>
        </Section>
      </div>

      <Section title="People Discovery" text="Folgen, Profil besuchen oder Kontakt aufnehmen. Vorschlaege respektieren Blocks und Sichtbarkeit." href="/explore/people" cta="Alle ansehen">
        {data.people.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.people.map((person) => (
              <MiniRow key={person.id} href={`/u/${person.username}`} icon={<CheckCircle2 className="h-4 w-4" />} title={person.name} text={person.city ? `Verifiziert - ${person.city}` : "Verifiziertes Mitglied"} />
            ))}
          </div>
        ) : (
          <EmptyState text="Noch keine Vorschlaege. Erweitere dein Netzwerk ueber Suche, Events oder Profilbesuche." href="/explore/people" cta="Menschen entdecken" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Sicherheit & Regeln" text="Connect funktioniert nur, wenn Vertrauen und Grenzen klar sind." href="/settings/privacy" cta="Privatsphaere">
          <div className="grid gap-3">
            <MiniRow href="/verify" icon={<ShieldCheck className="h-4 w-4" />} title="Verifizierung" text="Kein aktiver Zugang ohne Identitaetspruefung" />
            <MiniRow href="/settings/messages" icon={<MessageCircle className="h-4 w-4" />} title="Nachrichtenregeln" text="Steuere, wer dich kontaktieren darf" />
            <MiniRow href="/settings/security" icon={<Lock className="h-4 w-4" />} title="Blockieren & Sessions" text="Sicherheit, Passwort und aktive Geraete" />
            <MiniRow href="/settings/support" icon={<Bell className="h-4 w-4" />} title="Melden & Support" text="Problematische Kontakte melden" />
          </div>
        </Section>

        <Section title="Schnellaktionen" href="/profile" cta="Profil">
          <div className="grid gap-3">
            <HeroButton href="/chat/new" icon={<Send className="h-4 w-4" />} label="Neue Nachricht" />
            <HeroButton href="/explore/people" icon={<Search className="h-4 w-4" />} label="Menschen entdecken" />
            <HeroButton href="/friends" icon={<UsersRound className="h-4 w-4" />} label="Freunde verwalten" />
            <HeroButton href="/dating/matches" icon={<HeartHandshake className="h-4 w-4" />} label="Dating Matches" />
            <HeroButton href="/business/coffee" icon={<Coffee className="h-4 w-4" />} label="Coffee Chat" />
            <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events entdecken" />
            <HeroButton href="/local-services/create" icon={<Wrench className="h-4 w-4" />} label="Auftrag erstellen" />
            <HeroButton href="/profile/edit" icon={<UserRound className="h-4 w-4" />} label="Profil bearbeiten" />
            {isProvider ? <HeroButton href="/local-services/company/dashboard" icon={<Wrench className="h-4 w-4" />} label="Anbieter-Kontakte" /> : null}
            {isScanner ? <HeroButton href="/scanner" icon={<CheckCircle2 className="h-4 w-4" />} label="Scanner" /> : null}
            {isAdmin ? <HeroButton href="/admin/moderation" icon={<Sparkles className="h-4 w-4" />} label="Moderation" /> : null}
          </div>
        </Section>
      </div>
    </main>
  );
}

function HandshakeIcon() {
  return <Briefcase className="h-4 w-4" />;
}

function Section({ title, text, href, cta, children }: { title: string; text?: string; href: string; cta: string; children: ReactNode }) {
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

function HeroButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

function StatusCard({ href, icon, title, value, text, hot }: { href: string; icon: ReactNode; title: string; value: string; text: string; hot?: boolean }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">
          {icon}
          {hot ? <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#9C4A3C] ring-2 ring-hm-ivory" /> : null}
        </span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{value}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function ActionCard({ href, icon, title, text, label }: { href: string; icon: ReactNode; title: string; text: string; label: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{label}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function MiniRow({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
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
