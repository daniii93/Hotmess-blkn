export function HotelCodeBlock() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Hotel-Code</p>
      <p className="mt-2 text-lg font-semibold text-hm-ink">HM-IBK01-A7K2</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Buchung und Zahlung laufen direkt beim Partnerhotel.</p>
    </div>
  );
}

export function AddonSummary() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Extras</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Fast-Lane · Tisch 4er · Getränkepaket VIP</p>
    </div>
  );
}

export function TicketCard() {
  return (
    <article className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="grid aspect-square place-items-center rounded-card border border-hm-gold bg-hm-ivory text-center">
          <div>
            <p className="text-xs uppercase tracking-luxury text-hm-goldDeep">QR</p>
            <p className="mt-3 text-sm text-hm-inkSoft">signierter HMAC Token</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Gültiges Ticket</p>
          <h2 className="hm-display text-4xl text-hm-ink">HotMess Innsbruck</h2>
          <p className="text-sm leading-7 text-hm-inkSoft">Regular · 12.09.2026 · Holder-Snapshot mit Name, Foto und Geschlecht.</p>
          <HotelCodeBlock />
          <AddonSummary />
        </div>
      </div>
    </article>
  );
}

export function PastEventsTab() {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Vergangene Events</p>
      <p className="mt-3 text-sm text-hm-inkSoft">Benutzte Tickets erscheinen hier nach dem Einlass oder Eventabschluss.</p>
    </section>
  );
}
