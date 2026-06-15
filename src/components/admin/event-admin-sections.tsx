import Link from "next/link";
import { DEMO_EVENTS, DEMO_CODES } from "@/lib/demo-data";

const cardClass = "rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury";
const innerClass = "rounded-card border border-hm-borderSoft bg-hm-ivory p-4";

const statusColor: Record<string, string> = {
  published: "text-green-700 border-green-200 bg-green-50",
  draft: "text-hm-inkSoft border-hm-border bg-hm-champagne",
  cancelled: "text-red-700 border-red-200 bg-red-50",
};

export function EventCRUD() {
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Events</p>
        <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white" type="button">
          + Event anlegen
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Event</th>
              <th className="pb-3 pr-4">Datum</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Tickets W/M</th>
              <th className="pb-3 pr-4">Umsatz</th>
              <th className="pb-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {DEMO_EVENTS.map((ev) => (
              <tr className="border-t border-hm-borderSoft" key={ev.id}>
                <td className="py-3 pr-4">
                  <p className="font-semibold">{ev.title}</p>
                  <p className="text-xs text-hm-inkSoft">{ev.venue}</p>
                </td>
                <td className="pr-4">{ev.date} · {ev.doors}</td>
                <td className="pr-4">
                  <span className={`rounded-pill border px-2 py-0.5 text-xs font-medium ${statusColor[ev.status] ?? ""}`}>
                    {ev.statusLabel}
                  </span>
                </td>
                <td className="pr-4">
                  {ev.status !== "draft"
                    ? `W ${ev.soldF}/${ev.capacityF} · M ${ev.soldM}/${ev.capacityM}`
                    : "–"}
                </td>
                <td className="pr-4">
                  {ev.revenue > 0 ? `${ev.revenue.toLocaleString("de")} EUR` : "–"}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink" href={`/admin/events/${ev.slug}/sales`}>
                      Sales
                    </Link>
                    <Link className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink" href={`/admin/events/${ev.slug}/operations`}>
                      Ops
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function GenderConfigForm() {
  const ev = DEMO_EVENTS[0];
  const pctF = Math.round((ev.soldF / ev.capacityF) * 100);
  const pctM = Math.round((ev.soldM / ev.capacityM) * 100);
  return (
    <section className={innerClass}>
      <p className="font-semibold text-hm-ink">Gender-Konfiguration · {ev.title}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Weiblich</p>
          <p className="mt-1 text-lg font-semibold text-hm-ink">{ev.soldF} / {ev.capacityF}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hm-champagne">
            <div className="h-full rounded-full bg-hm-gold" style={{ width: `${pctF}%` }} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Männlich</p>
          <p className="mt-1 text-lg font-semibold text-hm-ink">{ev.soldM} / {ev.capacityM}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hm-champagne">
            <div className="h-full rounded-full bg-hm-gold" style={{ width: `${pctM}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-hm-inkSoft">Ratio 50/50 · Toleranz-Puffer ±5% · Diverse flexibel</p>
    </section>
  );
}

export function TicketTypeEditor() {
  const ev = DEMO_EVENTS[0];
  return (
    <section className={innerClass}>
      <p className="font-semibold text-hm-ink">Tickettypen · {ev.title}</p>
      <div className="mt-4 space-y-2">
        {ev.tickets.map((t) => (
          <div className="flex items-center justify-between text-sm" key={t.type}>
            <div>
              <span className="font-semibold text-hm-ink">{t.type}</span>
              <span className="ml-2 text-hm-inkSoft">· {t.price} EUR</span>
            </div>
            <div className="text-right">
              <span className={t.sold >= t.limit ? "font-semibold text-red-600" : "text-hm-ink"}>
                {t.sold} / {t.limit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TableEditor() {
  return (
    <section className={innerClass}>
      <p className="font-semibold text-hm-ink">Tische</p>
      <div className="mt-3 space-y-2">
        {[
          { size: "2er", count: 4, min: 2, minConsumption: 80 },
          { size: "4er", count: 8, min: 3, minConsumption: 180 },
          { size: "6er", count: 4, min: 5, minConsumption: 320 },
          { size: "8er", count: 2, min: 6, minConsumption: 480 },
        ].map((t) => (
          <div className="flex items-center justify-between text-sm" key={t.size}>
            <span className="font-semibold text-hm-ink">{t.size} ({t.count} Stück)</span>
            <span className="text-hm-inkSoft">min. {t.min} P. · {t.minConsumption} EUR Mindestverzehr</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DrinkPackageEditor() {
  return (
    <section className={innerClass}>
      <p className="font-semibold text-hm-ink">Getränkepakete</p>
      <div className="mt-3 space-y-2">
        {[
          { name: "Basic", price: 89, items: "6 Shots, 4 Mixer" },
          { name: "Standard", price: 149, items: "1 Flasche, 6 Shots, Mixer" },
          { name: "VIP", price: 249, items: "2 Flaschen, 10 Shots, Mixer, Fast-Lane" },
        ].map((p) => (
          <div className="flex items-center justify-between text-sm" key={p.name}>
            <div>
              <span className="font-semibold text-hm-ink">{p.name}</span>
              <span className="ml-2 text-xs text-hm-inkSoft">· {p.items}</span>
            </div>
            <span className="font-semibold text-hm-ink">{p.price} EUR</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LiveSalesDashboard() {
  const ev = DEMO_EVENTS[0];
  const total = ev.soldF + ev.soldM;
  const cap = ev.capacityF + ev.capacityM;
  return (
    <section className={cardClass}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Realtime Sales · {ev.title}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Verkauft", `${total} / ${cap}`],
          ["Umsatz", `${ev.revenue.toLocaleString("de")} EUR`],
          ["Warteliste", String(ev.waitlist)],
        ].map(([label, value]) => (
          <div className={innerClass} key={label}>
            <p className="text-sm text-hm-inkSoft">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-hm-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-hm-champagne">
        <div className="h-full rounded-full bg-hm-admin" style={{ width: `${Math.round((total / cap) * 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-hm-inkSoft">{Math.round((total / cap) * 100)}% ausgelastet</p>
    </section>
  );
}

export function GenderBreakdown() {
  const ev = DEMO_EVENTS[0];
  return (
    <section className={innerClass}>
      <p className="font-semibold text-hm-ink">Gender Breakdown · {ev.title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Weiblich", sold: ev.soldF, cap: ev.capacityF },
          { label: "Männlich", sold: ev.soldM, cap: ev.capacityM },
        ].map((g) => {
          const pct = Math.round((g.sold / g.cap) * 100);
          return (
            <div key={g.label}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-hm-ink">{g.label}</span>
                <span className="text-hm-inkSoft">{g.sold}/{g.cap} · {pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hm-champagne">
                <div className="h-full rounded-full bg-hm-gold" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function GuestListExport() {
  return (
    <button className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink hover:bg-hm-champagne" type="button">
      Gästeliste exportieren (CSV)
    </button>
  );
}

export function CancelEventButton() {
  return (
    <button className="rounded-pill border border-hm-error px-5 py-3 text-sm font-semibold text-hm-error" type="button">
      Event absagen
    </button>
  );
}

export function ScannerAccessManager() {
  return (
    <section className={cardClass}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Scanner Zugriff</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Scanner pro Event freischalten</h2>
      <div className="mt-5 space-y-2">
        {[
          { name: "Djordje Boskovic", gate: "Haupteingang", event: "Innsbruck", active: true },
          { name: "Scanner 2", gate: "VIP-Eingang", event: "Innsbruck", active: false },
        ].map((s) => (
          <div className={`${innerClass} flex items-center justify-between`} key={s.name}>
            <div>
              <p className="font-semibold text-hm-ink">{s.name}</p>
              <p className="text-xs text-hm-inkSoft">{s.gate} · {s.event}</p>
            </div>
            <span className={`rounded-pill border px-2 py-0.5 text-xs font-medium ${s.active ? "border-green-300 bg-green-50 text-green-700" : "border-hm-border bg-hm-champagne text-hm-inkSoft"}`}>
              {s.active ? "Aktiv" : "Inaktiv"}
            </span>
          </div>
        ))}
      </div>
      <button className="mt-4 rounded-pill border border-hm-admin/40 px-4 py-2 text-sm font-semibold text-hm-ink" type="button">
        + Scanner hinzufügen
      </button>
    </section>
  );
}

export function DiscountCodeManager() {
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Discount Codes</p>
        <button className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink" type="button">+ Code erstellen</button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Code</th>
              <th className="pb-3 pr-4">Typ</th>
              <th className="pb-3 pr-4">Wert</th>
              <th className="pb-3 pr-4">Einlösungen</th>
              <th className="pb-3">Läuft ab</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {DEMO_CODES.map((c) => (
              <tr className="border-t border-hm-borderSoft" key={c.code}>
                <td className="py-3 pr-4 font-mono font-semibold">{c.code}</td>
                <td className="pr-4 capitalize">{c.type}</td>
                <td className="pr-4">{c.type === "percent" ? `${c.value}%` : `${c.value} EUR`}</td>
                <td className="pr-4">{c.uses}{c.limit ? ` / ${c.limit}` : " / ∞"}</td>
                <td className="text-hm-inkSoft">{c.expires ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
