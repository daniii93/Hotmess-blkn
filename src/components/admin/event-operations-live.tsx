import type { EventOperationsSnapshot } from "@/features/admin/event-operations-service";

const card = "rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory p-4";

export function EventOperationsLive({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
      <CheckinLive snapshot={snapshot} />
      <div className="grid gap-5 lg:grid-cols-2">
        <TableAssignment snapshot={snapshot} />
        <BottleServicePlan snapshot={snapshot} />
        <BirthdayList snapshot={snapshot} />
        <HotelCodePlan snapshot={snapshot} />
        <HotMessTimeTracker snapshot={snapshot} />
      </div>
    </section>
  );
}

export function EventSettlementLive({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  const ev = snapshot.settlement;
  const gross = ev.tickets + ev.addons + ev.hotel + ev.hotmessTime + ev.other;
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Event-Abrechnung</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Nettogewinn {ev.net.toLocaleString("de")} EUR</h2>
      <p className="mt-1 text-sm text-hm-inkSoft">Status: {ev.status}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["Tickets", ev.tickets],
          ["Add-ons", ev.addons],
          ["Hotel-Provision", ev.hotel],
          ["HotMess Time", ev.hotmessTime],
          ["Sonstiges", ev.other],
          ["Gesamteinnahmen", gross],
          ["Kosten", ev.costs],
        ].map(([label, value]) => (
          <div className={soft} key={String(label)}>
            <p className="text-xs text-hm-inkSoft">{label}</p>
            <p className="mt-1 font-semibold text-hm-ink">{Number(value).toLocaleString("de")} EUR</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckinLive({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  const total = Math.max(snapshot.checkin.expected, 1);
  const pct = Math.round((snapshot.checkin.checkedIn / total) * 100);
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Check-in Live</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{snapshot.checkin.checkedIn} / {snapshot.checkin.expected} eingelassen</h2>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-hm-champagne">
        <div className="h-full rounded-full bg-hm-admin" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-hm-inkSoft">{pct}% - {Math.max(0, snapshot.checkin.expected - snapshot.checkin.checkedIn)} noch draussen - {snapshot.checkin.waitlist} auf Warteliste</p>
    </section>
  );
}

function TableAssignment({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return <Panel title="Tisch-Zuweisung" empty="Noch keine Tischbuchungen." items={snapshot.tables.map((table) => `${table.label} - ${table.persons} Personen - ${table.status}`)} />;
}

function BottleServicePlan({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return <Panel title="Bottle-Service / Getraenkepakete" empty="Noch keine Getraenkepakete." items={snapshot.drinks.map((drink) => `${drink.packageName} - ${drink.service} - ${drink.preferredTime} - ${drink.status}`)} />;
}

function BirthdayList({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return <Panel title="Geburtstage" empty="Noch keine Geburtstagspakete." items={snapshot.birthdays.map((birthday) => `${birthday.time} - ${birthday.surprise ? "Ueberraschung" : "offen"} - ${birthday.status}`)} />;
}

function HotelCodePlan({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return <Panel title="Hotel-Codes" empty="Noch keine Hotel-Codes erzeugt." items={snapshot.hotelCodes.map((code) => `${code.code} - ${code.status} - ${code.commission} EUR Provision`)} />;
}

function HotMessTimeTracker({ snapshot }: { snapshot: EventOperationsSnapshot }) {
  return <Panel title="HotMess Time" empty="Noch keine HotMess-Time-Bloecke." items={snapshot.hotmessTime.map((block) => `${block.label} - ${block.gross} EUR brutto - Split ${block.split} - ${block.status}`)} />;
}

function Panel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  const rows = items.length ? items : [empty];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map((item) => (
          <div className="rounded-card border border-hm-borderSoft bg-hm-porcelain px-3 py-2 text-sm text-hm-inkSoft" key={item}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

