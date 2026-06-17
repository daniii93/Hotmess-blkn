import Link from "next/link";
import { AdminModerationActions } from "@/components/admin/admin-moderation-actions";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import {
  DEMO_ACTIVITY,
  DEMO_DISTRIBUTION_PARTNERS,
  DEMO_EVENTS,
  DEMO_FINANCE,
  DEMO_KPI,
  DEMO_PARTNERS,
  DEMO_USERS,
} from "@/lib/demo-data";
import type { AdminActivityItem, AdminAnalyticsItem, AdminFinanceEvent, AdminKpiItem, AdminModerationItem, AdminUserRowLive, AdminLiveSnapshot } from "@/features/admin/live-service";

const card = "rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory p-4";

const adminDemoLinks = [
  ["Dashboard", "/admin", "KPIs, Umsatz, Funnel, Aktivität"],
  ["Events", "/admin/events", "CRUD, Gender, Tickets, Add-ons"],
  ["Live Sales", "/admin/events/hotmess-innsbruck/sales", "Realtime Verkauf und Warteliste"],
  ["Operations", "/admin/events/hotmess-innsbruck/operations", "Check-in, Tische, Bottle-Service"],
  ["Settlement", "/admin/events/hotmess-innsbruck/settlement", "Event-Abrechnung und Kosten"],
  ["Nutzer", "/admin/users", "Suche, Detail, Rollen, Sanktionen"],
  ["Verifikationen", "/admin/users/verifications", "Stripe Identity Sonderfälle"],
  ["Finanzen", "/admin/finance", "Umsatz, Gewinn, Partnerabrechnung"],
  ["Partner", "/admin/partners", "Hotel, Club, Sponsoren"],
  ["Partnerprogramm", "/admin/partners-program", "Provisionen, Auszahlungen, Material"],
  ["Codes", "/admin/codes", "Rabattcodes und Bulk-Generator"],
  ["Scanner", "/admin/scanners", "Scanner-Zugänge je Event"],
  ["Moderation", "/admin/moderation", "Meldungen und Sanktionen"],
  ["Broadcast", "/admin/broadcast", "Segmentierte Push/E-Mail Kampagnen"],
  ["Analytics", "/admin/analytics", "Nutzer, Events, Dating, Business"],
  ["Settings", "/admin/settings", "Feature Flags, Inhalte, Admin-Team"],
] as const;

export function AdminDemoIndex() {
  return (
    <section className={card}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Demo Admin Zugriff</p>
          <h2 className="hm-display mt-3 text-3xl text-hm-ink">Alle Admin-Funktionen</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
            Lokale Vorschau mit Demo-Admin-Cookie. In Produktion bleibt Admin-Zugriff an echte Rollen und 2FA gebunden.
          </p>
        </div>
        <Link className="rounded-pill border border-hm-admin/40 px-4 py-2 text-sm font-semibold text-hm-ink" href="/">
          Zur Landing
        </Link>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {adminDemoLinks.map(([title, href, description]) => (
          <Link
            className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4 transition hover:-translate-y-0.5 hover:border-hm-admin"
            href={href}
            key={href}
          >
            <p className="font-semibold text-hm-ink">{title}</p>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function KpiGrid({ items: liveItems }: { items?: AdminKpiItem[] }) {
  const items: AdminKpiItem[] = liveItems ?? [
    ["Mitglieder", String(DEMO_KPI.members.toLocaleString("de")), DEMO_KPI.membersGrowth],
    ["Verkäufe heute", String(DEMO_KPI.salesToday) + " Tickets", DEMO_KPI.salesLabel],
    ["Umsatz Monat", DEMO_KPI.revenueMonth, DEMO_KPI.revenueGrowth],
    ["Aktiv (DAU)", DEMO_KPI.dau.toLocaleString("de"), DEMO_KPI.dauLabel],
    ["Verifizierung", String(DEMO_KPI.verifyOpen) + " offen", DEMO_KPI.verifyLabel],
    ["Offene Mods", String(DEMO_KPI.modOpen) + " Meldungen", DEMO_KPI.modLabel],
    ["Nächstes Event", DEMO_KPI.nextEvent, DEMO_KPI.nextEventDays],
    ["Wartelisten", DEMO_KPI.waitlist, DEMO_KPI.waitlistLabel],
  ].map(([label, value, hint]) => ({ label, value, hint }));

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, hint }) => (
        <div className={card} key={label}>
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-hm-ink">{value}</p>
          <p className="mt-1 text-sm text-hm-inkSoft">{hint}</p>
        </div>
      ))}
    </section>
  );
}

export function RevenueChart({ bars: liveBars }: { bars?: number[] }) {
  const bars = liveBars?.length ? liveBars : [36, 52, 44, 68, 61, 84, 78, 96, 72, 88, 91, 74];
  const months = ["Mai", "Mai", "Mai", "Jun", "Jun", "Jun", "Jun", "Jul", "Jul", "Jul", "Aug", "Aug"];
  return (
    <section className={card}>
      <div className="flex items-end justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Umsatz 30 Tage</p>
        <p className="text-sm font-semibold text-hm-ink">34.200 EUR</p>
      </div>
      <div className="mt-5 flex h-48 items-end gap-2 border-b border-hm-borderSoft px-1">
        {bars.map((height, index) => (
          <div className="group relative flex-1" key={index}>
            <div
              className="w-full rounded-t-sm bg-hm-admin/25 transition-all group-hover:bg-hm-admin/60"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 px-1">
        {months.map((m, i) => (
          <span className="flex-1 text-center text-[9px] text-hm-inkSoft" key={i}>{m}</span>
        ))}
      </div>
      <p className="mt-3 text-sm text-hm-inkSoft">Tickets, Add-ons, Dating und Business aus daily_metrics.</p>
    </section>
  );
}

export function SalesFunnel({ steps: liveSteps }: { steps?: Array<{ label: string; pct: number; count: string }> }) {
  const steps = liveSteps ?? [
    { label: "Besucher", pct: 100, count: "8.420" },
    { label: "Registriert", pct: 34, count: "2.847" },
    { label: "Verifiziert", pct: 24, count: "2.014" },
    { label: "Ticket gekauft", pct: 11, count: "921" },
  ];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Verkaufs-Trichter</p>
      <div className="mt-5 grid gap-3">
        {steps.map((step) => (
          <div className={soft} key={step.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-hm-ink">{step.label}</span>
              <span className="text-hm-inkSoft">{step.count} · {step.pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hm-champagne">
              <div className="h-full rounded-full bg-hm-admin/60" style={{ width: `${step.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NextEventCard({ event }: { event?: AdminLiveSnapshot["nextEvent"] }) {
  const ev = event ?? {
    title: DEMO_EVENTS[0].title,
    slug: DEMO_EVENTS[0].slug,
    venue: DEMO_EVENTS[0].venue,
    date: DEMO_EVENTS[0].date,
    doors: DEMO_EVENTS[0].doors,
    soldF: DEMO_EVENTS[0].soldF,
    capacityF: DEMO_EVENTS[0].capacityF,
    soldM: DEMO_EVENTS[0].soldM,
    capacityM: DEMO_EVENTS[0].capacityM,
    revenue: DEMO_EVENTS[0].revenue,
    waitlist: DEMO_EVENTS[0].waitlist,
  };
  if (!ev) {
    return (
      <section className={card}>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Naechstes Event</p>
        <h2 className="hm-display mt-3 text-3xl text-hm-ink">Noch kein Event</h2>
        <Link className="mt-4 inline-flex rounded-pill border border-hm-admin/40 px-4 py-2 text-sm font-semibold text-hm-ink" href="/admin/events">
          Event erstellen
        </Link>
      </section>
    );
  }
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Nächstes Event</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{ev.title}</h2>
      <p className="mt-2 text-sm text-hm-inkSoft">{ev.venue} · {ev.date} · Einlass {ev.doors}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          `W ${ev.soldF}/${ev.capacityF}`,
          `M ${ev.soldM}/${ev.capacityM}`,
          `${ev.revenue.toLocaleString("de")} EUR`,
        ].map((item) => (
          <div className={soft} key={item}><span className="font-semibold text-hm-ink">{item}</span></div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <Link className="rounded-pill border border-hm-admin/40 px-4 py-2 text-sm font-semibold text-hm-ink" href={`/admin/events/${ev.slug}/sales`}>
          Live Sales
        </Link>
        <Link className="rounded-pill border border-hm-admin/40 px-4 py-2 text-sm font-semibold text-hm-ink" href={`/admin/events/${ev.slug}/operations`}>
          Operations
        </Link>
      </div>
    </section>
  );
}

export function ActivityFeed({ items }: { items?: AdminActivityItem[] }) {
  const typeColor: Record<string, string> = {
    ticket: "text-hm-goldDeep",
    verify: "text-green-600",
    mod: "text-red-500",
    business: "text-hm-admin",
    broadcast: "text-hm-admin",
    scanner: "text-hm-inkSoft",
    dating: "text-pink-500",
  };
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Letzte Aktivität</p>
      <div className="mt-5 space-y-2">
        {(items?.length ? items : DEMO_ACTIVITY).map((item) => (
          <div className={`${soft} flex items-start justify-between gap-4`} key={item.text}>
            <p className="text-sm text-hm-ink">{item.text}</p>
            <span className={`shrink-0 text-xs font-medium ${typeColor[item.type] ?? "text-hm-inkSoft"}`}>{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuickActions() {
  const actions = [
    { label: "Event erstellen", href: "/admin/events" },
    { label: "Verifikationen", href: "/admin/users/verifications" },
    { label: "Broadcast", href: "/admin/broadcast" },
    { label: "Moderation", href: "/admin/moderation" },
  ];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Schnellaktionen</p>
      <div className="mt-5 flex flex-col gap-2">
        {actions.map((action) => (
          <Link
            className="rounded-pill border border-hm-admin/40 px-4 py-2 text-center text-sm font-semibold text-hm-ink transition hover:border-hm-admin"
            href={action.href}
            key={action.label}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function UserTable({ users }: { users?: AdminUserRowLive[] }) {
  const rows = users?.length ? users : DEMO_USERS;
  const statusColor: Record<string, string> = {
    aktiv: "text-green-700 bg-green-50 border-green-200",
    inaktiv: "text-hm-inkSoft bg-hm-champagne border-hm-border",
    gesperrt: "text-red-700 bg-red-50 border-red-200",
  };
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Nutzer</p>
        <span className="text-sm text-hm-inkSoft">{rows.length} sichtbar</span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Stadt</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Verifiziert</th>
              <th className="pb-3 pr-4">Rolle</th>
              <th className="pb-3 pr-4">Tickets</th>
              <th className="pb-3 pr-4">Beitritt</th>
              <th className="pb-3">Admin-Aktionen</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {rows.map((u) => (
              <tr className="border-t border-hm-borderSoft" key={u.id}>
                <td className="py-3 pr-4">
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-hm-inkSoft">{u.email}</p>
                  </div>
                </td>
                <td className="pr-4">{u.city}</td>
                <td className="pr-4">
                  <span className={`rounded-pill border px-2 py-0.5 text-xs font-medium ${statusColor[u.status] ?? ""}`}>
                    {u.status}
                  </span>
                </td>
                <td className="pr-4">
                  <span className={u.verified ? "text-green-600" : "text-hm-inkSoft"}>
                    {u.verified ? "✓ Ja" : "Nein"}
                  </span>
                </td>
                <td className="pr-4 capitalize">{u.role}</td>
                <td className="pr-4">{u.tickets}</td>
                <td className="pr-4 text-hm-inkSoft">{u.joined}</td>
                <td>
                  <AdminUserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function UserDetail({ user }: { user?: AdminUserRowLive }) {
  const u = user ?? DEMO_USERS[0];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Nutzer-Detail</p>
      <div className="mt-4 space-y-3">
        <div className={soft}>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Stammdaten</p>
          <p className="mt-2 font-semibold text-hm-ink">{u.name}</p>
          <p className="text-sm text-hm-inkSoft">{u.email} · {u.city} · seit {u.joined}</p>
        </div>
        <div className={soft}>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Aktivität</p>
          <p className="mt-2 text-sm text-hm-ink">{u.tickets} Tickets · verifiziert · Dating aktiv</p>
        </div>
        <div className={soft}>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Stripe Identity</p>
          <p className="mt-2 text-sm text-hm-ink">Session verified · kein Ausweisdatum gespeichert</p>
        </div>
      </div>
    </section>
  );
}

export function SanctionPanel({ user }: { user?: AdminUserRowLive }) {
  const selected = user ?? DEMO_USERS[0];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Sanktionen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Fuer: {selected.name}</p>
      <p className="mt-4 text-sm text-hm-ink">Live-Aktionen stehen direkt in der Nutzer-Tabelle: Rolle aendern, warnen, temporaer sperren oder Posting blockieren. Jede Aktion schreibt einen Audit-Eintrag.</p>
    </section>
  );
}

export function VerificationQueue({ users }: { users?: AdminUserRowLive[] }) {
  const pending = (users?.length ? users : DEMO_USERS).filter((u) => !u.verified);
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Verifikationen</p>
        <span className="rounded-pill bg-hm-admin/10 px-3 py-1 text-xs font-semibold text-hm-admin">{DEMO_KPI.verifyOpen} offen</span>
      </div>
      <p className="mt-3 text-sm text-hm-inkSoft">Stripe-Identity-Sonderfälle — nur Status und Session-Referenz sichtbar, keine Ausweisdaten.</p>
      <div className="mt-4 space-y-2">
        {pending.map((u) => (
          <div className={`${soft} flex items-center justify-between`} key={u.id}>
            <div>
              <p className="font-semibold text-hm-ink">{u.name}</p>
              <p className="text-xs text-hm-inkSoft">{u.city} · Session: stripe_sess_demo_{u.id}</p>
            </div>
            <button className="rounded-pill border border-green-400 px-3 py-1 text-xs font-semibold text-green-700" type="button">Freigeben</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ModerationQueue({ items }: { items?: AdminModerationItem[] }) {
  const cases = items?.length ? items : [
    { content: "Post · Spam · 4 Meldungen", user: "@nexo", priority: "hoch" },
    { content: "Dating-Profil · Fake · 2 Meldungen", user: "@unknown_user", priority: "mittel" },
    { content: "Job-Listing · unangemessen · 1 Meldung", user: "@biz_demo", priority: "niedrig" },
  ];
  const pColor: Record<string, string> = {
    hoch: "text-red-600 border-red-200 bg-red-50",
    mittel: "text-orange-600 border-orange-200 bg-orange-50",
    niedrig: "text-hm-inkSoft border-hm-border bg-hm-ivory",
  };
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Moderations-Warteschlange</p>
        <span className="rounded-pill bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{DEMO_KPI.modOpen} offen</span>
      </div>
      <div className="mt-5 space-y-3">
        {cases.map((c) => (
          <div className={`${soft} flex items-center justify-between gap-3`} key={c.content}>
            <div>
              <p className="font-semibold text-hm-ink">{c.content}</p>
              <p className="text-xs text-hm-inkSoft">{c.user}</p>
              {"id" in c ? <AdminModerationActions item={c as AdminModerationItem} /> : null}
            </div>
            <span className={`rounded-pill border px-2 py-0.5 text-xs font-medium ${pColor[c.priority] ?? ""}`}>{c.priority}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ModerationCase() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Fall-Kontext</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Private Chat-Inhalte nur bei konkreter Meldung sichtbar. Inhalt: „Hey, klick diesen Link…"</p>
    </section>
  );
}

export function ActionPanel() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Aktionen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Live-Aktionen stehen direkt an jedem Fall in der Warteschlange. Jede Entscheidung wird in admin_audit protokolliert.</p>
    </section>
  );
}

export function BroadcastComposer() {
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Broadcast erstellen</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {[
          { field: "Kanal", placeholder: "Push / E-Mail / Beide" },
          { field: "Betreff", placeholder: "HotMess Wien fast ausverkauft" },
          { field: "Nachricht", placeholder: "Nur noch wenige Tickets für Wien…" },
          { field: "CTA-Link", placeholder: "https://hotmess-blkn.app/events/wien-2026-10" },
        ].map(({ field, placeholder }) => (
          <label className="flex flex-col gap-2" key={field}>
            <span className="text-xs font-semibold uppercase tracking-luxury text-hm-inkSoft">{field}</span>
            <input
              className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm outline-none focus:border-hm-admin"
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>
      <button className="mt-5 rounded-pill bg-hm-ink px-6 py-3 text-sm font-semibold text-white" type="button">
        Broadcast senden
      </button>
    </section>
  );
}

export function SegmentBuilder() {
  const segments = ["Stadt", "Geschlecht", "Verifiziert", "Hat Ticket", "Dating", "Business", "Inaktiv 30+ Tage"];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Segment Builder</p>
      <p className="mt-1 text-sm text-hm-inkSoft">Aktives Segment: Alle Nutzer in Wien und Innsbruck mit Ticket — 921 Empfänger</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {segments.map((s) => (
          <button className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink transition hover:border-hm-admin" key={s} type="button">{s}</button>
        ))}
      </div>
    </section>
  );
}

export function BroadcastStats() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Letzte Kampagne</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[["Gesendet", "2.104"], ["Geöffnet", "1.341 · 63,7%"], ["Klicks", "487 · 23,1%"]].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">{label}</p>
            <p className="mt-1 font-semibold text-hm-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinanceOverview({ finance }: { finance?: AdminFinanceEvent[] }) {
  const rows = finance?.length ? finance : DEMO_FINANCE;
  const total = rows.reduce((sum, e) => sum + e.tickets + e.addons + e.hotel + e.other, 0);
  const net = rows.reduce((sum, e) => sum + e.net, 0);
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Finanzen</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Gesamtumsatz</p>
          <p className="mt-2 text-3xl font-semibold text-hm-ink">{total.toLocaleString("de")} EUR</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Nettogewinn</p>
          <p className="mt-2 text-3xl font-semibold text-hm-ink">{net.toLocaleString("de")} EUR</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">Marge</p>
          <p className="mt-2 text-3xl font-semibold text-hm-ink">{Math.round((net / total) * 100)}%</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-hm-inkSoft">Tickets, Fast-Lane, Tische, Getränkepakete, Hotel-Provision, Dating und Business Plus.</p>
    </section>
  );
}

export function PerEventPnL({ finance }: { finance?: AdminFinanceEvent[] }) {
  const rows = finance?.length ? finance : DEMO_FINANCE;
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Pro-Event-Bilanz</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Event</th>
              <th className="pb-3 pr-4">Einnahmen</th>
              <th className="pb-3 pr-4">Kosten</th>
              <th className="pb-3">Netto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const gross = row.tickets + row.addons + row.hotel + row.other;
              return (
                <tr className="border-t border-hm-borderSoft" key={row.event}>
                  <td className="py-3 pr-4 font-semibold text-hm-ink">{row.event}</td>
                  <td className="pr-4 text-hm-ink">{gross.toLocaleString("de")} EUR</td>
                  <td className="pr-4 text-hm-inkSoft">{row.costs.toLocaleString("de")} EUR</td>
                  <td className="font-semibold text-green-700">{row.net.toLocaleString("de")} EUR</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PartnerSettlements() {
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Partner-Abrechnung</p>
      <div className="mt-4 space-y-2">
        {DEMO_PARTNERS.map((p) => (
          <div className={`${soft} flex items-center justify-between gap-3`} key={p.name}>
            <div>
              <p className="font-semibold text-hm-ink">{p.name}</p>
              <p className="text-xs text-hm-inkSoft">{p.type} · {p.commission}% Provision</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-hm-ink">{p.revenue.toLocaleString("de")} EUR</p>
              {p.outstanding > 0 && (
                <p className="text-xs text-orange-600">{p.outstanding.toLocaleString("de")} offen</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinanceExport() {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-pill border border-hm-admin/40 px-5 py-3 text-sm font-semibold text-hm-ink" type="button">
        Export für Steuerberater (CSV)
      </button>
      <button className="rounded-pill border border-hm-admin/40 px-5 py-3 text-sm font-semibold text-hm-ink" type="button">
        Partnerabrechnungen exportieren
      </button>
    </div>
  );
}

export function HotelManager() {
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Hotels</p>
      <div className="mt-4 space-y-2">
        {DEMO_PARTNERS.filter((p) => p.type === "Hotel").map((p) => (
          <div className={`${soft} flex items-center justify-between`} key={p.name}>
            <div>
              <p className="font-semibold text-hm-ink">{p.name}</p>
              <p className="text-xs text-hm-inkSoft">Provision {p.commission}% · Perks und Code nach Ticketkauf</p>
            </div>
            <span className="rounded-pill border border-green-300 px-2 py-0.5 text-xs text-green-700">{p.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClubManager() {
  const club = DEMO_PARTNERS.find((p) => p.type === "Club");
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Clubs</p>
      {club && <p className="mt-1 text-sm text-hm-inkSoft">{club.name} · Getränke-Anteil {club.commission}% · HotMess-Time 50/50</p>}
    </section>
  );
}

export function SponsorManager() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Sponsoren</p>
      {DEMO_PARTNERS.filter((p) => p.type === "Sponsor").map((p) => (
        <p className="mt-1 text-sm text-hm-inkSoft" key={p.name}>{p.name} · {p.commission}% · Bronze Paket</p>
      ))}
    </section>
  );
}

export function AnalyticsDashboards({ items }: { items?: AdminAnalyticsItem[] }) {
  const areas = items ?? [
    { label: "Nutzer", value: "2.847 gesamt · +124 Woche" },
    { label: "Events", value: "2 aktiv · 921 Tickets" },
    { label: "Engagement", value: "DAU 1.203 · Posts 347" },
    { label: "Dating", value: "612 Opt-in · 47 Matches" },
    { label: "Business", value: "184 Opt-in · 23 Matches" },
    { label: "Finanzen", value: "34.200 EUR Monat" },
  ];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Analytics</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {areas.map((area) => (
          <div className={soft} key={area.label}>
            <p className="font-semibold text-hm-ink">{area.label}</p>
            <p className="mt-1 text-sm text-hm-inkSoft">{area.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PlatformToggles() {
  const toggles = [
    { label: "Registrierung offen", active: true },
    { label: "Dating global", active: true },
    { label: "Business global", active: true },
    { label: "Wartungsmodus", active: false },
    { label: "Reservierungs-Timeout", active: true },
    { label: "Mindestalter 18+", active: true },
  ];
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Plattform-Schalter</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {toggles.map((toggle) => (
          <div className={`${soft} flex items-center justify-between`} key={toggle.label}>
            <span className="font-semibold text-hm-ink">{toggle.label}</span>
            <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${toggle.active ? "bg-green-50 text-green-700" : "bg-hm-champagne text-hm-inkSoft"}`}>
              {toggle.active ? "AN" : "AUS"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContentEditor() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Inhalte</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["AGB", "Datenschutz", "Onboarding-Texte", "E-Mail-Templates", "Tags", "Branchen"].map((item) => (
          <button className="rounded-pill border border-hm-border px-3 py-1 text-xs text-hm-ink" key={item} type="button">{item}</button>
        ))}
      </div>
    </section>
  );
}

export function AdminTeam() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Admin-Team</p>
      <div className="mt-3 space-y-2">
        {[{ name: "Haupt-Admin", email: "admin@hotmess-blkn.app", role: "Super Admin" }].map((member) => (
          <div className="flex items-center justify-between text-sm" key={member.email}>
            <div>
              <p className="font-semibold text-hm-ink">{member.name}</p>
              <p className="text-xs text-hm-inkSoft">{member.email}</p>
            </div>
            <span className="rounded-pill border border-hm-admin/40 px-2 py-0.5 text-xs text-hm-admin">{member.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartnerList() {
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Vertriebspartner</p>
        <span className="text-sm text-hm-inkSoft">{DEMO_DISTRIBUTION_PARTNERS.length} aktiv</span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Code</th>
              <th className="pb-3 pr-4">Stufe</th>
              <th className="pb-3 pr-4">Tickets</th>
              <th className="pb-3 pr-4">Provision</th>
              <th className="pb-3">Offen</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {DEMO_DISTRIBUTION_PARTNERS.map((p) => (
              <tr className="border-t border-hm-borderSoft" key={p.name}>
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

export function PayoutApprovals() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Auszahlungen freigeben</p>
      <div className="mt-3 space-y-2">
        {DEMO_DISTRIBUTION_PARTNERS.map((p) => (
          <div className="flex items-center justify-between text-sm" key={p.name}>
            <span className="text-hm-ink">{p.name} · {p.pending.toLocaleString("de")} EUR offen</span>
            <button className="rounded-pill border border-green-400 px-3 py-1 text-xs text-green-700" type="button">Freigeben</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CommissionOverview() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Provisionsübersicht</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["Pending", `${DEMO_DISTRIBUTION_PARTNERS.reduce((s, p) => s + p.pending, 0).toLocaleString("de")} EUR`],
          ["Confirmed", "816 EUR"],
          ["Paid", "2.340 EUR"],
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

export function MaterialManager() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Material verwalten</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Story-Vorlagen", "Flyer PDF", "Captions", "Event-Grafiken"].map((item) => (
          <button className="rounded-pill border border-hm-border px-3 py-1 text-xs text-hm-ink" key={item} type="button">
            {item} ↓
          </button>
        ))}
      </div>
    </section>
  );
}

export function TierConfig() {
  const tiers = [
    { level: 1, name: "Starter", own: "8%", threshold: "10 Tickets" },
    { level: 2, name: "Active", own: "10%", threshold: "25 Tickets" },
    { level: 3, name: "Pro", own: "12%", threshold: "50 Tickets" },
  ];
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Karrierestufen</p>
      <div className="mt-3 space-y-2">
        {tiers.map((t) => (
          <div className="flex items-center justify-between text-sm" key={t.level}>
            <span className="font-semibold text-hm-ink">Stufe {t.level} · {t.name}</span>
            <span className="text-hm-inkSoft">{t.own} ab {t.threshold}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BottleServicePlan() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Bottle-Service</p>
      <div className="mt-3 space-y-2">
        {["Slot 1 · Tisch 4 · Champagner Paket · gebucht", "Slot 2 · Tisch 7 · VIP Paket · offen", "Slot 3 · Tisch 12 · Standard · gebucht"].map((slot) => (
          <div className="flex items-center justify-between text-sm" key={slot}>
            <span className="text-hm-ink">{slot.split(" · ").slice(0, 2).join(" · ")}</span>
            <span className={slot.includes("gebucht") ? "text-green-600" : "text-hm-inkSoft"}>
              {slot.includes("gebucht") ? "Gebucht" : "Offen"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BirthdayList() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Geburtstage</p>
      <div className="mt-3 space-y-2">
        {[
          { name: "Ana Markovic", time: "22:45", surprise: true },
          { name: "Marko Jovanovic", time: "00:15", surprise: false },
        ].map((b) => (
          <div className="flex items-center justify-between text-sm" key={b.name}>
            <span className="font-semibold text-hm-ink">{b.name} · {b.time}</span>
            {b.surprise && <span className="rounded-pill border border-hm-gold px-2 py-0.5 text-xs text-hm-goldDeep">Überraschung</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TableAssignment() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">Tisch-Zuweisung</p>
      <div className="mt-3 space-y-2">
        {[
          { nr: "T-04", size: "4er", guests: "Ana + 3", status: "bestätigt" },
          { nr: "T-07", size: "6er", guests: "Marko + 5", status: "bestätigt" },
          { nr: "T-12", size: "2er", guests: "offen", status: "offen" },
        ].map((t) => (
          <div className="flex items-center justify-between text-sm" key={t.nr}>
            <span className="font-semibold text-hm-ink">{t.nr} · {t.size} · {t.guests}</span>
            <span className={t.status === "bestätigt" ? "text-green-600" : "text-hm-inkSoft"}>{t.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HotMessTimeTracker() {
  return (
    <section className={soft}>
      <p className="font-semibold text-hm-ink">HotMess Time</p>
      <div className="mt-3 space-y-2">
        {[
          { block: "Block 1 · 23:00–00:00", sales: "840 EUR", split: "420 EUR / 420 EUR" },
          { block: "Block 2 · 00:00–01:00", sales: "1.120 EUR", split: "560 EUR / 560 EUR" },
        ].map((b) => (
          <div className="flex items-center justify-between text-sm" key={b.block}>
            <span className="text-hm-ink">{b.block}</span>
            <span className="text-hm-inkSoft">{b.split}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CheckinLive() {
  const ev = DEMO_EVENTS[0];
  const total = ev.soldF + ev.soldM;
  const checkedIn = 214;
  const pct = Math.round((checkedIn / total) * 100);
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Check-in Live</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{checkedIn} / {total} eingelassen</h2>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-hm-champagne">
        <div className="h-full rounded-full bg-hm-admin" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-hm-inkSoft">{pct}% · {total - checkedIn} noch draußen · {ev.waitlist} auf Warteliste</p>
    </section>
  );
}

export function EventSettlement() {
  const ev = DEMO_FINANCE[0];
  const gross = ev.tickets + ev.addons + ev.hotel + ev.other;
  return (
    <section className={card}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Event-Abrechnung</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Nettogewinn {ev.net.toLocaleString("de")} EUR</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["Tickets", ev.tickets],
          ["Add-ons", ev.addons],
          ["Hotel-Provision", ev.hotel],
          ["Sonstiges", ev.other],
          ["Gesamteinnahmen", gross],
          ["Kosten (DJ, Personal, Location)", ev.costs],
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
