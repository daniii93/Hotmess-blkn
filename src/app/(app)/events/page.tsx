import { Briefcase, CalendarDays, HeartHandshake, Hotel, Ticket, UsersRound, Wrench } from "lucide-react";
import {
  EventEmptyState,
  EventFilter,
  EventGrid,
  EventHubButton,
  EventHubSection,
  EventMiniLink,
  EventsEcosystemGrid,
  EventsHubHero,
  EventTransparencyOverview,
} from "@/components/events/event-sections";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { formatEventDate } from "@/features/events/format";
import { getEventTransparencyMap } from "@/features/events/transparency";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, profile, tickets] = await Promise.all([
    getPublishedEvents(),
    getCurrentUserProfile().catch(() => null),
    getCurrentUserTickets().catch(() => []),
  ]);
  const transparencies = await getEventTransparencyMap(events);
  const now = Date.now();
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const weeklyEvents = events.filter((event) => {
    const start = new Date(event.dateStart).getTime();
    return start >= now && start <= weekEnd;
  });
  const nearbyEvents = profile?.city ? events.filter((event) => event.city?.toLowerCase() === profile.city?.toLowerCase()).slice(0, 3) : [];
  const waitlistEvents = events.filter((event) => event.status === "sold_out" || (transparencies.get(event.id)?.waitlist ?? 0) > 0);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <EventsHubHero profile={profile} />

      <EventHubSection
        title="Event-Suche & Filter"
        text="Filter sind vorbereitet und nutzen vorhandene Eventdaten. Ticketstatus, Warteliste und Transparenz bleiben echte Daten."
        href="/events"
        cta="Alle Events"
      >
        <EventFilter />
      </EventHubSection>

      <EventHubSection
        title="Empfohlene Events"
        text="Bald stattfindende Events mit Ticketstatus, Warteliste und transparenten Kapazitaetsdaten."
        href="/events"
        cta="Aktualisieren"
      >
        <EventGrid events={events} transparencies={transparencies} />
      </EventHubSection>

      <EventHubSection
        title="Transparenz & Vertrauen"
        text="HotMess zeigt keine Fake-Knappheit. Mitglieder sehen Kapazitaet, verkaufte Tickets, Verfuegbarkeit und Warteliste aus echten Plattformdaten."
        href="/events"
        cta="Events pruefen"
      >
        <EventTransparencyOverview events={events} transparencies={transparencies} />
      </EventHubSection>

      <div className="grid gap-7 lg:grid-cols-2">
        <EventHubSection
          title={profile?.city ? `Events in ${profile.city}` : "Events in deiner Naehe"}
          text={profile?.city ? "Nach deinem Profilstandort gefiltert." : "Ergaenze deinen Standort, damit HotMess lokale Events besser einordnet."}
          href="/profile/edit"
          cta={profile?.city ? "Standort bearbeiten" : "Standort ergaenzen"}
        >
          <EventListOrEmpty
            events={nearbyEvents.length ? nearbyEvents : events.slice(0, 3)}
            emptyText="Noch keine passenden Events in deiner Naehe gefunden."
          />
        </EventHubSection>

        <EventHubSection title="Diese Woche" text="Schneller Einstieg fuer Events, bei denen bald etwas passiert." href="/events" cta="Alle anzeigen">
          <EventListOrEmpty events={weeklyEvents.slice(0, 4)} emptyText="Diese Woche ist noch kein Event geplant. Schau spaeter wieder vorbei." />
        </EventHubSection>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <EventHubSection title="Tickets & Meine Events" text="Bestehende Ticket-, QR- und Checkout-Logik bleibt unveraendert." href="/tickets" cta="Tickets oeffnen">
          {tickets.length ? (
            <div className="grid gap-3">
              {tickets.slice(0, 3).map((ticket) => (
                <EventMiniLink
                  key={ticket.id}
                  href="/tickets"
                  icon={<Ticket className="h-4 w-4" />}
                  title={ticket.event?.title ?? "HotMess Ticket"}
                  text={`${ticket.status} · ${ticket.event ? formatEventDate(ticket.event.dateStart) : "Datum offen"}`}
                />
              ))}
            </div>
          ) : (
            <EventEmptyState text="Du hast noch keine Tickets. Entdecke Events und sichere dir dein erstes Ticket." href="/events" cta="Events ansehen" />
          )}
        </EventHubSection>

        <EventHubSection title="Wartelisten" text="Wartelisten werden nur angezeigt, wenn echte Eintraege oder ausverkaufte Events vorhanden sind." href="/events" cta="Event waehlen">
          <EventListOrEmpty events={waitlistEvents.slice(0, 4)} emptyText="Du stehst aktuell auf keiner Warteliste, und es gibt keine aktiven Wartelisten-Events." />
        </EventHubSection>
      </div>

      <EventHubSection
        title="Event-Kreislauf"
        text="Events verbinden Tickets, Dating, Business, Dienstleistungen, Benefits und Community. Jede Kachel fuehrt in einen bestehenden Plattformbereich."
        href="/discover"
        cta="Discover"
      >
        <EventsEcosystemGrid profile={profile} />
      </EventHubSection>

      <div className="grid gap-7 lg:grid-cols-2">
        <EventHubSection title="Event Dating & Networking" text="Keine Dating-Profile in Eventlisten. Nur sicherer Einstieg fuer Nutzer mit Opt-in." href="/dating" cta="Dating oeffnen">
          <div className="grid gap-3">
            <EventMiniLink href="/dating" icon={<HeartHandshake className="h-4 w-4" />} title="Menschen beim selben Event" text={profile?.dating_enabled ? "Event-Filter und Matches oeffnen." : "Dating aktivieren, um Event-Matches zu sehen."} />
            <EventMiniLink href="/chat" icon={<UsersRound className="h-4 w-4" />} title="Event-Gruppen & Chat" text="Event-Kommunikation laeuft ueber den HotMess Chat." />
          </div>
        </EventHubSection>

        <EventHubSection title="Business Events" text="Business-Networking bleibt getrennt vom privaten Feed, verknuepft sich aber sinnvoll mit Events." href="/business" cta="Business">
          <div className="grid gap-3">
            <EventMiniLink href="/business" icon={<Briefcase className="h-4 w-4" />} title="Business-Kontakte" text={profile?.business_enabled ? "Coffee Chats und Kontakte entdecken." : "Business-Profil aktivieren."} />
            <EventMiniLink href="/business/jobs" icon={<Briefcase className="h-4 w-4" />} title="Event-Jobs" text="Recruiting und Personal rund um Events." />
          </div>
        </EventHubSection>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <EventHubSection title="Benefits, Hotels & Add-ons" text="Eventnahe Vorteile statt eigener Hotel-Insel." href="/benefits" cta="Benefits">
          <div className="grid gap-3">
            <EventMiniLink href="/benefits" icon={<Hotel className="h-4 w-4" />} title="Hotelcodes & Partner" text="Partnerangebote rund um Events werden hier gebuendelt." />
            <EventMiniLink href="/tickets" icon={<Ticket className="h-4 w-4" />} title="Tische, Drinks, Birthday" text="Add-ons bleiben an Ticket und Event gebunden." />
          </div>
        </EventHubSection>

        <EventHubSection title="Event-Dienstleister" text="DJs, Security, Technik, Catering und Personal laufen ueber das Dienstleistungsmodul." href="/local-services" cta="Dienstleister">
          <div className="grid gap-3">
            <EventMiniLink href="/local-services" icon={<Wrench className="h-4 w-4" />} title="Dienstleister finden" text="Verifizierte Anbieter fuer dein Event suchen." />
            <EventMiniLink href="/local-services/create" icon={<Wrench className="h-4 w-4" />} title="Event-Auftrag erstellen" text="Anfrage fuer Security, DJ, Technik oder Catering stellen." />
          </div>
        </EventHubSection>
      </div>

      <EventHubSection title="Schnellaktionen" href="/profile" cta="Profil">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <EventHubButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events entdecken" />
          <EventHubButton href="/tickets" icon={<Ticket className="h-4 w-4" />} label="Ticket anzeigen" />
          <EventHubButton href="/create" icon={<CalendarDays className="h-4 w-4" />} label="Event-Moment teilen" />
          <EventHubButton href="/chat" icon={<UsersRound className="h-4 w-4" />} label="Freunde einladen" />
          <EventHubButton href="/dating" icon={<HeartHandshake className="h-4 w-4" />} label="Dating fuer Events" />
          <EventHubButton href="/business/coffee" icon={<Briefcase className="h-4 w-4" />} label="Coffee Chat" />
          <EventHubButton href="/local-services" icon={<Wrench className="h-4 w-4" />} label="Dienstleister finden" />
          <EventHubButton href={profile?.role === "admin" ? "/admin/events" : "/services/events"} icon={<CalendarDays className="h-4 w-4" />} label={profile?.role === "admin" ? "Admin Events" : "Veranstalter werden"} />
        </div>
      </EventHubSection>
    </main>
  );
}

function EventListOrEmpty({ events, emptyText }: { events: Awaited<ReturnType<typeof getPublishedEvents>>; emptyText: string }) {
  if (!events.length) {
    return <EventEmptyState text={emptyText} href="/events" cta="Alle Events" />;
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <EventMiniLink
          key={event.id}
          href={`/events/${event.slug}`}
          icon={<CalendarDays className="h-4 w-4" />}
          title={event.title}
          text={`${event.city} · ${formatEventDate(event.dateStart)}`}
        />
      ))}
    </div>
  );
}
