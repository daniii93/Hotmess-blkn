import Link from "next/link";

type EventCardData = {
  title: string;
  slug: string;
  city: string;
  date: string;
  category: string;
  priceFrom: string;
  status: string;
};

type Capacity = {
  label: string;
  sold: number;
  capacity: number;
};

const demoEvents: EventCardData[] = [
  {
    title: "HotMess Innsbruck",
    slug: "innsbruck-2026-09",
    city: "Innsbruck",
    date: "12.09.2026",
    category: "Club",
    priceFrom: "ab 25 EUR",
    status: "Veröffentlicht",
  },
  {
    title: "HotMess Wien",
    slug: "wien-2026-10",
    city: "Wien",
    date: "10.10.2026",
    category: "Konzert",
    priceFrom: "ab 32 EUR",
    status: "Fast voll",
  },
];

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

export function EventCard({ event }: { event: EventCardData }) {
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
            {event.date} · {event.category} · {event.priceFrom}
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

export function EventGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {demoEvents.map((event) => (
        <EventCard event={event} key={event.slug} />
      ))}
    </div>
  );
}

export function EventHero({ slug }: { slug: string }) {
  return (
    <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-80 bg-[radial-gradient(circle_at_25%_20%,rgba(198,163,93,.28),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-ivory))]" />
        <div className="flex flex-col justify-end p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Event</p>
          <h1 className="hm-display mt-4 text-5xl text-hm-ink">HotMess {slug.replaceAll("-", " ")}</h1>
          <p className="mt-5 leading-8 text-hm-inkSoft">
            Live-Kontingent, Teilnehmer, Hotel-Vorteil und personalisierte Tickets in einem geschlossenen Kaufkreis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white hover:bg-hm-goldDeep" href={`/events/${slug}/checkout`}>
              Ticket kaufen
            </Link>
            <Link className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink hover:bg-hm-champagne" href={`/events/${slug}/waitlist`}>
              Warteliste ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GenderCapacityLive({
  capacities = [
    { label: "Weiblich", sold: 180, capacity: 200 },
    { label: "Männlich", sold: 195, capacity: 200 },
  ],
}: {
  capacities?: Capacity[];
}) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Live 50/50 Kontingent</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {capacities.map((item) => {
          const percent = Math.min(100, Math.round((item.sold / item.capacity) * 100));
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
      <div className="mt-5 flex items-center gap-3">
        {["A", "M", "D", "S"].map((name) => (
          <span className="grid size-11 place-items-center rounded-full border border-hm-gold bg-hm-ivory text-sm font-semibold text-hm-ink" key={name}>
            {name}
          </span>
        ))}
        <p className="text-sm text-hm-inkSoft">+ 47 weitere aus deiner HotMess Umgebung</p>
      </div>
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

export function TicketTypeList() {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Tickets</p>
      <div className="mt-5 grid gap-3">
        {["Early Bird · 20 EUR", "Regular · 25 EUR", "VIP · 45 EUR"].map((item) => (
          <div className="flex items-center justify-between rounded-card border border-hm-borderSoft bg-hm-ivory p-4" key={item}>
            <span className="font-semibold text-hm-ink">{item}</span>
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
        {["Tische", "Getränkepakete", "Fast-Lane", "Geburtstag"].map((item) => (
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4 text-sm font-semibold text-hm-ink" key={item}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
