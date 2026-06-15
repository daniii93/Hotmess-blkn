import type { UserTicket } from "@/features/events/live-service";
import { formatEventDate, formatMoney } from "@/features/events/format";

export function HotelCodeBlock() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Hotel-Code</p>
      <p className="mt-2 text-lg font-semibold text-hm-ink">Wird nach Hotel-Anbindung erzeugt</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Buchung und Zahlung laufen direkt beim Partnerhotel.</p>
    </div>
  );
}

export function AddonSummary() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Extras</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Add-ons werden im naechsten Ausbau mit dem Ticket verbunden.</p>
    </div>
  );
}

export function TicketCard({ ticket }: { ticket: UserTicket }) {
  return (
    <article className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="grid aspect-square place-items-center rounded-card border border-hm-gold bg-hm-ivory p-4 text-center">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-luxury text-hm-goldDeep">QR Token</p>
            <p className="mt-3 break-all font-mono text-xs text-hm-inkSoft">{ticket.qrToken ?? "Noch nicht erzeugt"}</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">{ticket.status === "used" ? "Benutztes Ticket" : "Gueltiges Ticket"}</p>
          <h2 className="hm-display text-4xl text-hm-ink">{ticket.event?.title ?? "HotMess Event"}</h2>
          <p className="text-sm leading-7 text-hm-inkSoft">
            {ticket.ticketType?.name ?? "Ticket"} · {ticket.event ? formatEventDate(ticket.event.dateStart) : ""} · {ticket.holderName}
          </p>
          {ticket.ticketType ? <p className="text-sm font-semibold text-hm-ink">{formatMoney(ticket.ticketType.priceCents, ticket.ticketType.currency)}</p> : null}
          <HotelCodeBlock />
          <AddonSummary />
        </div>
      </div>
    </article>
  );
}

export function TicketList({ tickets }: { tickets: UserTicket[] }) {
  const active = tickets.filter((ticket) => ticket.status !== "used");

  if (active.length === 0) {
    return (
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 text-sm text-hm-inkSoft shadow-luxury">
        Du hast noch kein aktives Ticket. Kaufe zuerst ein Event-Ticket.
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {active.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

export function PastEventsTab({ tickets = [] }: { tickets?: UserTicket[] }) {
  const used = tickets.filter((ticket) => ticket.status === "used");

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Vergangene Events</p>
      <p className="mt-3 text-sm text-hm-inkSoft">
        {used.length > 0 ? `${used.length} benutzte Tickets.` : "Benutzte Tickets erscheinen hier nach dem Einlass oder Eventabschluss."}
      </p>
    </section>
  );
}
