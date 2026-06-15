import Link from "next/link";
import type { LiveEvent } from "@/features/events/live-service";
import { formatEventDate, formatMoney } from "@/features/events/format";

type Capacity = {
  label: string;
  sold: number;
  capacity: number;
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

export function EventCard({ event }: { event: LiveEvent }) {
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

export function EventGrid({ events }: { events: LiveEvent[] }) {
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
        <EventCard event={event} key={event.slug} />
      ))}
    </div>
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
      <p className="mt-5 text-sm text-hm-inkSoft">Wird aus echten Ticket-Inhabern gefuellt, sobald die ersten Tickets verkauft sind.</p>
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
