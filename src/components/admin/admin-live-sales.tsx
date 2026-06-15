import type { LiveEvent } from "@/features/events/live-service";
import { formatMoney } from "@/features/events/format";

export function AdminLiveSales({ event }: { event: LiveEvent }) {
  const config = event.genderConfig;
  const sold = (config?.soldFemale ?? 0) + (config?.soldMale ?? 0) + (config?.soldDiverse ?? 0);
  const revenue = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.quantitySold * ticketType.priceCents, 0);
  const capacity = event.capacityTotal || (config ? config.capacityFemale + config.capacityMale + config.capacityDiverse : 0);
  const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Live Sales · {event.title}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Verkauft", `${sold} / ${capacity}`],
          ["Umsatz", formatMoney(revenue)],
          ["Status", event.status],
        ].map(([label, value]) => (
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4" key={label}>
            <p className="text-sm text-hm-inkSoft">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-hm-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-hm-champagne">
        <div className="h-full rounded-full bg-hm-admin" style={{ width: `${pct}%` }} />
      </div>
      {config ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4 text-sm">
            <span className="font-semibold text-hm-ink">Weiblich</span>
            <span className="ml-2 text-hm-inkSoft">{config.soldFemale}/{config.capacityFemale}</span>
          </div>
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4 text-sm">
            <span className="font-semibold text-hm-ink">Maennlich</span>
            <span className="ml-2 text-hm-inkSoft">{config.soldMale}/{config.capacityMale}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
