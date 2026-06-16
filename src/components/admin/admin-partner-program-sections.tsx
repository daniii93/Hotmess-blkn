import type { AdminPartnerProgramSnapshot } from "@/features/admin/partner-program-service";

const card = "rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory p-4";

export function AdminPartnerProgramSections({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
      <PartnerList snapshot={snapshot} />
      <div className="grid gap-5 lg:grid-cols-2">
        <PayoutApprovals snapshot={snapshot} />
        <CommissionOverview snapshot={snapshot} />
        <MaterialManager snapshot={snapshot} />
        <TierConfig snapshot={snapshot} />
      </div>
    </section>
  );
}

function PartnerList({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  const rows = snapshot.partners;
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Vertriebspartner</p>
        <span className="text-sm text-hm-inkSoft">{rows.length} Partner</span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Code</th>
              <th className="pb-3 pr-4">Stufe</th>
              <th className="pb-3 pr-4">Tickets</th>
              <th className="pb-3 pr-4">Bezahlt</th>
              <th className="pb-3">Pending</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {(rows.length ? rows : [{ id: "empty", name: "Noch keine Partner", code: "-", level: "-", tickets: 0, commission: 0, pending: 0, status: "empty" }]).map((p) => (
              <tr className="border-t border-hm-borderSoft" key={p.id}>
                <td className="py-3 pr-4 font-semibold">{p.name}</td>
                <td className="pr-4 font-mono text-xs">{p.code}</td>
                <td className="pr-4">{p.level}</td>
                <td className="pr-4">{p.tickets}</td>
                <td className="pr-4">{p.commission.toLocaleString("de")} EUR</td>
                <td className="text-orange-600">{p.pending.toLocaleString("de")} EUR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PayoutApprovals({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  const rows = snapshot.payouts.length ? snapshot.payouts : [{ id: "empty", partnerName: "Keine offenen Auszahlungen", amount: 0, status: "-" }];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Auszahlungen freigeben</p>
      <div className="mt-3 space-y-2">
        {rows.map((p) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={p.id}>
            <span className="text-hm-ink">{p.partnerName} - {p.amount.toLocaleString("de")} EUR - {p.status}</span>
            {p.id !== "empty" && <button className="rounded-pill border border-green-400 px-3 py-1 text-xs text-green-700" type="button">Freigeben</button>}
          </div>
        ))}
      </div>
    </section>
  );
}

function CommissionOverview({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Provisionsuebersicht</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["Pending", `${snapshot.totals.pending.toLocaleString("de")} EUR`],
          ["Confirmed", `${snapshot.totals.confirmed.toLocaleString("de")} EUR`],
          ["Paid", `${snapshot.totals.paid.toLocaleString("de")} EUR`],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">{label}</p>
            <p className="mt-1 font-semibold text-hm-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MaterialManager({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  const rows = snapshot.materials.length ? snapshot.materials : [{ title: "Noch kein Material", type: "offen" }];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Material verwalten</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((item) => (
          <button className="rounded-pill border border-hm-border px-3 py-1 text-xs text-hm-ink" key={item.title} type="button">
            {item.title} - {item.type}
          </button>
        ))}
      </div>
    </section>
  );
}

function TierConfig({ snapshot }: { snapshot: AdminPartnerProgramSnapshot }) {
  const tiers = snapshot.tiers.length ? snapshot.tiers : [{ level: 1, name: "Starter", own: "2%", threshold: "0 Tickets", override: "0% Team" }];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Karrierestufen</p>
      <div className="mt-3 space-y-2">
        {tiers.map((t) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={t.level}>
            <span className="font-semibold text-hm-ink">Stufe {t.level} - {t.name}</span>
            <span className="text-right text-hm-inkSoft">{t.own} ab {t.threshold} - {t.override}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

