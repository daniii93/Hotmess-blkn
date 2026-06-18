import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Coffee,
  HeartHandshake,
  Hotel,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { LiveEvent } from "@/features/events/live-service";
import { formatEventDate, formatMoney } from "@/features/events/format";
import type { EventTransparencySummary } from "@/features/events/transparency";

type Capacity = {
  label: string;
  sold: number;
  capacity: number;
};

const numberFormat = new Intl.NumberFormat("de-AT");
const formatNumber = (value: number) => numberFormat.format(value);

const formatRelativeActivity = (value: string | null) => {
  if (!value) return "Noch keine Ticketaktivitaet";
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (diffMinutes < 1) return "Gerade eben gebucht";
  if (diffMinutes < 60) return `Zuletzt vor ${diffMinutes} Min. gebucht`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Zuletzt vor ${diffHours} Std. gebucht`;
  return `Zuletzt vor ${Math.round(diffHours / 24)} Tagen gebucht`;
};

export function EventFilter() {
  return (
    <div className="grid gap-3 rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-luxury sm:grid-cols-3">
      {["Stadt", "Kategorie", "Datum"].map((label) => (
        <button
          key={label}
          className="rounded-pill border border-hm-borderSoft bg-hm-ivory px-4 py-3 text-left text-sm font-medium text-hm-inkSoft transition hover:border-hm-gold hover:text-hm-ink"
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function EventCard({ event, transparency }: { event: LiveEvent; transparency?: EventTransparencySummary }) {
  const priceFrom = event.ticketTypes.length > 0 ? formatMoney(Math.min(...event.ticketTypes.map((ticket) => ticket.priceCents))) : "Preis folgt";

  return (
    <article className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
      <div className="aspect-[16/10] bg-[linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-luxury text-hm-inkSoft">
          <span>{event.city}</span>
          <span className="rounded-pill border border-hm-gold px-3 py-1 text-hm-goldDeep">{event.status}</span>
        </div>
        <div>
          <h2 className="hm-display text-3xl text-hm-ink">{event.title}</h2>
          <p className="mt-2 text-sm text-hm-inkSoft">
            {formatEventDate(event.dateStart)} · {event.category} · ab {priceFrom}
          </p>
        </div>
        {transparency ? (
          <div className="rounded-2xl border border-hm-gold/20 bg-hm-ivory p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">
              <span>Transparenz</span>
              <span>{transparency.soldPercent}% vergeben</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-hm-champagne">
              <div className="h-full rounded-full bg-hm-gold" style={{ width: `${transparency.soldPercent}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-hm-ink">
              {formatNumber(transparency.sold)} von {formatNumber(transparency.capacity)} Plaetzen vergeben
            </p>
            <p className="mt-1 text-xs text-hm-inkSoft">
              {formatNumber(transparency.available)} verfuegbar · {formatNumber(transparency.waitlist)} Warteliste
            </p>
          </div>
        ) : null}
        <Link
          className="inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-hm-goldDeep"
          href={`/events/${event.slug}`}
        >
          Event ansehen
        </Link>
      </div>
    </article>
  );
}

export function EventGrid({ events, transparencies }: { events: LiveEvent[]; transparencies?: Map<string, EventTransparencySummary> }) {
  if (events.length === 0) {
    return (
      <div className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-sm text-hm-inkSoft shadow-luxury">
        Noch keine publizierten Events. Lege im Admin-Bereich das erste Event an.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {events.map((event) => (
        <EventCard event={event} key={event.slug} transparency={transparencies?.get(event.id)} />
      ))}
    </div>
  );
}

export function EventsHubHero({ profile }: { profile?: { first_name?: string | null; username?: string | null; role?: string | null } | null }) {
  const name = profile?.first_name ?? profile?.username ?? "HotMess";
  const isAdmin = profile?.role === "admin";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain shadow-luxury">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-h-80 bg-[radial-gradient(circle_at_20%_20%,rgba(198,163,93,.32),transparent_32%),linear-gradient(135deg,var(--hm-ink),var(--hm-goldDeep))]" />
        <div className="flex flex-col justify-end p-6 sm:p-10">
          <p className="hm-label text-hm-goldDeep">Events</p>
          <h1 className="hm-display mt-4 text-4xl text-hm-ink sm:text-6xl">
            Entdecke Events, echte Menschen und neue Moeglichkeiten.
          </h1>
          <p className="mt-5 text-sm leading-7 text-hm-inkSoft sm:text-base">
            Hallo {name}. HotMess zeigt dir echte Ticketzahlen, faire Wartelisten, Event-Dating,
            Business-Networking, Benefits und Dienstleister rund um dein Erlebnis.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <EventHubButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events entdecken" />
            <EventHubButton href="/tickets" icon={<Ticket className="h-4 w-4" />} label="Meine Tickets" />
            <EventHubButton href="/dating" icon={<HeartHandshake className="h-4 w-4" />} label="Event Dating" />
            <EventHubButton href={isAdmin ? "/admin/events" : "/services/events"} icon={<ShieldCheck className="h-4 w-4" />} label={isAdmin ? "Event Admin" : "Veranstalter werden"} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventHubSection({ title, text, href, cta, children }: { title: string; text?: string; href: string; cta: string; children: React.ReactNode }) {
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

export function EventHubButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

export function EventMiniLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
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

export function EventEmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function EventTransparencyOverview({ events, transparencies }: { events: LiveEvent[]; transparencies: Map<string, EventTransparencySummary> }) {
  const rows = events.slice(0, 3);
  if (rows.length === 0) {
    return <EventEmptyState text="Noch keine Events mit Transparenzdaten. Sobald Events publiziert sind, siehst du hier echte Zahlen." href="/admin/events" cta="Events verwalten" />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {rows.map((event) => {
        const summary = transparencies.get(event.id);
        return summary ? <EventTrustCard event={event} summary={summary} key={event.id} /> : null;
      })}
    </div>
  );
}

export function EventTrustCard({ event, summary }: { event: LiveEvent; summary: EventTransparencySummary }) {
  return (
    <Link href={`/events/${event.slug}`} className="rounded-card border border-hm-gold/20 bg-hm-ivory p-4 transition hover:border-hm-gold">
      <div className="flex items-center justify-between gap-3">
        <p className="hm-label text-hm-goldDeep">Vertrauen</p>
        <BadgeCheck className="h-5 w-5 text-hm-goldDeep" />
      </div>
      <h3 className="mt-3 text-base font-black text-hm-ink">{event.title}</h3>
      <p className="mt-2 text-xs text-hm-inkSoft">{summary.mode === "full" ? "Vollstaendige Transparenz" : "Transparenz aktiv"}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-hm-champagne">
        <div className="h-full rounded-full bg-hm-gold" style={{ width: `${summary.soldPercent}%` }} />
      </div>
      <p className="mt-3 text-sm font-bold text-hm-ink">{formatNumber(summary.sold)} / {formatNumber(summary.capacity)} Plaetze</p>
      <p className="mt-1 text-xs text-hm-inkSoft">{formatNumber(summary.available)} verfuegbar · {formatNumber(summary.waitlist)} Warteliste</p>
    </Link>
  );
}

export function EventHero({ event }: { event: LiveEvent }) {
  return (
    <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-80 bg-[radial-gradient(circle_at_25%_20%,rgba(198,163,93,.28),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-ivory))]" />
        <div className="flex flex-col justify-end p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Event</p>
          <h1 className="hm-display mt-4 text-5xl text-hm-ink">{event.title}</h1>
          <p className="mt-3 text-sm font-semibold text-hm-inkSoft">{formatEventDate(event.dateStart)} · {event.venue?.name ?? event.city}</p>
          <p className="mt-5 leading-8 text-hm-inkSoft">{event.description ?? event.subtitle ?? "HotMess Event mit Live-Kontingent und personalisiertem QR-Ticket."}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white hover:bg-hm-goldDeep" href={`/events/${event.slug}/checkout`}>
              Ticket kaufen
            </Link>
            <Link className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink hover:bg-hm-champagne" href={`/events/${event.slug}/waitlist`}>
              Warteliste ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventTransparencyPanel({ summary }: { summary: EventTransparencySummary }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Event Transparenz</p>
          <h2 className="hm-display mt-3 text-3xl text-hm-ink">Echte Zahlen. Keine kuenstliche Verknappung.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-hm-inkSoft">
            HotMess zeigt aggregierte Eventdaten aus dem Ticketing. Keine Teilnehmernamen, keine privaten Profildaten, keine Fake-Meldungen.
          </p>
        </div>
        <span className="rounded-pill border border-hm-gold/30 bg-hm-champagne px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-hm-ink">
          {summary.mode === "full" ? "Vollstaendig" : summary.mode}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <TransparencyStat label="Kapazitaet" value={formatNumber(summary.capacity)} />
        <TransparencyStat label="Verkauft" value={formatNumber(summary.sold)} />
        <TransparencyStat label="Verfuegbar" value={formatNumber(summary.available)} />
        <TransparencyStat label="Reserviert" value={formatNumber(summary.reserved)} />
        <TransparencyStat label="Warteliste" value={formatNumber(summary.waitlist)} />
      </div>

      <div className="mt-6 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
        <div className="flex items-center justify-between text-sm font-bold text-hm-ink">
          <span>{formatNumber(summary.sold)} von {formatNumber(summary.capacity)} Plaetzen vergeben</span>
          <span>{summary.soldPercent}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-hm-champagne">
          <div className="h-full rounded-full bg-hm-gold" style={{ width: `${summary.soldPercent}%` }} />
        </div>
        <p className="mt-3 text-xs font-semibold text-hm-inkSoft">{formatRelativeActivity(summary.lastTicketActivityAt)}</p>
      </div>

      {summary.gender ? (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {summary.gender.map((row) => (
            <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4" key={row.label}>
              <div className="flex justify-between text-sm font-semibold text-hm-ink">
                <span>{row.label}</span>
                <span>{formatNumber(row.count)} · {row.percent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-hm-champagne">
                <div className="h-full rounded-full bg-hm-gold" style={{ width: `${row.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-hm-gold/30 bg-hm-ivory p-4 text-sm text-hm-inkSoft">
          Besucherstruktur wird nur angezeigt, wenn echte aggregierte Daten vorhanden sind.
        </p>
      )}
    </section>
  );
}

function TransparencyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{label}</p>
      <p className="mt-2 text-2xl font-black text-hm-ink">{value}</p>
    </div>
  );
}

export function EventTrustStatus({ summary }: { summary: EventTransparencySummary }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Veranstalter Vertrauensstatus</p>
      <div className="mt-5 grid gap-3">
        {summary.trustItems.map((item) => (
          <div className="flex items-center gap-3 rounded-xl border border-hm-borderSoft bg-hm-ivory px-4 py-3 text-sm font-semibold text-hm-ink" key={item}>
            <CheckCircle2 className="h-4 w-4 text-hm-goldDeep" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EventEcosystemDetail({ event }: { event: LiveEvent }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Rund um dieses Event</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <EventMiniLink href="/dating" icon={<HeartHandshake className="h-4 w-4" />} title="Event Dating" text="Menschen kennenlernen, die zum selben Event gehen" />
        <EventMiniLink href="/business" icon={<Briefcase className="h-4 w-4" />} title="Business Networking" text="Coffee Chats und Kontakte rund um Events" />
        <EventMiniLink href="/local-services" icon={<Wrench className="h-4 w-4" />} title="Event-Dienstleister" text="DJ, Security, Technik oder Catering finden" />
        <EventMiniLink href={`/events/${event.slug}/waitlist`} icon={<UsersRound className="h-4 w-4" />} title="Warteliste" text="Fairer Platz, sobald Kontingente frei werden" />
      </div>
    </section>
  );
}

export function EventsEcosystemGrid({ profile }: { profile?: { role?: string | null; dating_enabled?: boolean | null; business_enabled?: boolean | null } | null }) {
  const isAdmin = profile?.role === "admin";
  const isScanner = profile?.role === "scanner" || profile?.role === "admin";

  const cards = [
    { href: "/tickets", icon: <Ticket className="h-4 w-4" />, title: "Tickets & Meine Events", text: "QR-Codes, Bestellungen, Check-in und vergangene Events." },
    { href: "/dating", icon: <HeartHandshake className="h-4 w-4" />, title: "Event Dating", text: profile?.dating_enabled ? "Dein Event-Kontext fuer Matches." : "Aktiviere Dating, um Event-Matches zu entdecken." },
    { href: "/business", icon: <Coffee className="h-4 w-4" />, title: "Business Events", text: profile?.business_enabled ? "Coffee Chats, Gruppen und Jobs rund um Events." : "Aktiviere Business fuer Networking am Event." },
    { href: "/benefits", icon: <Hotel className="h-4 w-4" />, title: "Hotels & Benefits", text: "Hotelcodes, VIP-Vorteile, Tisch- und Birthday-Pakete." },
    { href: "/local-services", icon: <Wrench className="h-4 w-4" />, title: "Event-Dienstleister", text: "Dienstleister fuer dein Event finden oder selbst sichtbar werden." },
    { href: "/feed", icon: <MessageCircle className="h-4 w-4" />, title: "Community Highlights", text: "Posts, Stories und Recaps nach dem Event." },
    { href: isAdmin ? "/admin/events" : "/services/events", icon: <Sparkles className="h-4 w-4" />, title: isAdmin ? "Veranstalter Hub" : "Veranstalter werden", text: isAdmin ? "Events, Sales, Operations und Settlement steuern." : "Freigabeprozess fuer Veranstalter vorbereiten." },
    ...(isScanner ? [{ href: "/scanner", icon: <ShieldCheck className="h-4 w-4" />, title: "Scanner", text: "Check-in fuer freigegebene Events oeffnen." }] : []),
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cards.map((card) => (
        <EventMiniLink key={card.title} {...card} />
      ))}
    </div>
  );
}

export function GenderCapacityLive({ event }: { event: LiveEvent }) {
  const config = event.genderConfig;
  const capacities: Capacity[] = config
    ? [
        { label: "Weiblich", sold: config.soldFemale, capacity: config.capacityFemale },
        { label: "Maennlich", sold: config.soldMale, capacity: config.capacityMale },
        ...(config.capacityDiverse > 0 ? [{ label: "Divers", sold: config.soldDiverse, capacity: config.capacityDiverse }] : []),
      ]
    : [];

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Live 50/50 Kontingent</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {capacities.map((item) => {
          const percent = item.capacity > 0 ? Math.min(100, Math.round((item.sold / item.capacity) * 100)) : 0;
          return (
            <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4" key={item.label}>
              <div className="flex justify-between text-sm font-semibold text-hm-ink">
                <span>{item.label}</span>
                <span>
                  {item.sold} / {item.capacity}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-hm-champagne">
                <div className="h-full rounded-full bg-hm-gold" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function WhoIsGoing() {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Wer geht noch</p>
      <p className="mt-5 text-sm text-hm-inkSoft">Teilnehmer werden aus echten Ticket-Inhabern gefuellt, aber nur datenschutzkonform und freiwillig sichtbar gemacht.</p>
    </section>
  );
}

export function HotelPerkCard() {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Hotel Vorteil</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Partnerhotel-Code nach Ticketkauf</h2>
      <p className="mt-3 leading-7 text-hm-inkSoft">
        Die Buchung bleibt direkt beim Hotel. HotMess zeigt nur den Vorteilscode und den externen Link.
      </p>
    </section>
  );
}

export function TicketTypeList({ event }: { event: LiveEvent }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Tickets</p>
      <div className="mt-5 grid gap-3">
        {event.ticketTypes.map((ticketType) => (
          <div className="flex items-center justify-between rounded-card border border-hm-borderSoft bg-hm-ivory p-4" key={ticketType.id}>
            <span className="font-semibold text-hm-ink">{ticketType.name} · {formatMoney(ticketType.priceCents, ticketType.currency)}</span>
            <span className="text-sm text-hm-inkSoft">personalisiert</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AddonPreview() {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Add-ons</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {["Tische", "Getraenkepakete", "Fast-Lane", "Geburtstag"].map((item) => (
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4 text-sm font-semibold text-hm-ink" key={item}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
