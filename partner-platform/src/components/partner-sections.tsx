import Link from "next/link";
import type { PartnerSnapshot } from "@/lib/partner-data";
import { mainAppUrl } from "@/lib/partner-data";

const defaultCode = "ANA2024";

const money = (cents: number) => `${Math.round(cents / 100).toLocaleString("de")} EUR`;

export function Hero() {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p className="eyebrow">Kostenloses Empfehlungsmarketing</p>
      <h1 className="display" style={{ fontSize: "clamp(42px, 8vw, 82px)", lineHeight: 1, margin: "20px 0" }}>Tickets verkaufen. Fair Provision verdienen.</h1>
      <p style={{ maxWidth: 720, color: "var(--partner-muted)", lineHeight: 1.8 }}>
        Partner verdienen nur an echten HotMess Ticketverkaeufen. Keine Eintrittsgebuehr, kein Pflichtkauf, keine Provision fuer reine Anwerbung.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
        <Link className="pill primary" href="/register">Partner werden</Link>
        <Link className="pill secondary" href="/login">Einloggen</Link>
      </div>
    </section>
  );
}

export function LegalGuardrails() {
  const rules = ["Provision nur auf echte Ticketverkaeufe", "Teilnahme kostenlos", "Kein Geld fuer reines Anwerben", "Jederzeit kuendbar", "Anwalts- und Steuerpruefung vor Launch"];
  return (
    <section className="shell grid" style={{ marginTop: 20 }}>
      {rules.map((rule) => <div className="card muted-card" key={rule}>{rule}</div>)}
    </section>
  );
}

export function PartnerKpis({ snapshot }: { snapshot: PartnerSnapshot }) {
  return (
    <section className="shell grid" style={{ marginTop: 24 }}>
      {snapshot.kpis.map(([label, value, hint]) => (
        <div className="card" key={label} style={{ padding: 22 }}>
          <p className="eyebrow">{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "12px 0 4px" }}>{value}</p>
          <p style={{ color: "var(--partner-muted)" }}>{hint}</p>
        </div>
      ))}
    </section>
  );
}

export function TierProgress({ snapshot }: { snapshot: PartnerSnapshot }) {
  const current = snapshot.balance.own_tickets_sold;
  const target = snapshot.nextTier?.required_own_sales ?? snapshot.tier.required_own_sales;
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 100;
  return (
    <section className="shell card" style={{ padding: 24, marginTop: 20 }}>
      <p style={{ fontWeight: 700 }}>{snapshot.nextTier ? `Aufstieg ${snapshot.tier.name} zu ${snapshot.nextTier.name}` : "Hoechste Karrierestufe erreicht"}</p>
      <div style={{ height: 12, background: "#efe7da", borderRadius: 999, overflow: "hidden", marginTop: 12 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--partner-gold)" }} />
      </div>
      <p style={{ color: "var(--partner-muted)" }}>
        {snapshot.nextTier ? `${current}/${target} eigene Tickets, noch ${Math.max(0, target - current)} bis zur naechsten Stufe.` : "Neue Verkaeufe laufen weiter in deine hoechste Provisionsstufe."}
      </p>
    </section>
  );
}

export function ActivityFeed({ snapshot }: { snapshot: PartnerSnapshot }) {
  return <Panel title="Letzte Aktivitaet" items={snapshot.activity} />;
}

export function SalesHistory({ snapshot }: { snapshot: PartnerSnapshot }) {
  const items = snapshot.referrals.map((ref) => `${ref.commission_type === "team_override" ? "Team-Override" : "Eigenverkauf"} - ${ref.attribution_method ?? "code"} - ${ref.status} - +${money(ref.commission_cents)}`);
  return <Panel title="Verkaufs-Historie" items={items.length ? items : ["Noch keine Verkaeufe erfasst."]} />;
}

export function TeamTree({ snapshot }: { snapshot: PartnerSnapshot }) {
  const items = snapshot.team.map((partner) => `${partner.first_name} ${partner.last_name} - Stufe ${partner.tier} - Code ${partner.referral_code}`);
  return <Panel title="Dein Team" items={items.length ? items : ["Noch keine direkten Partner."]} />;
}

export function TeamStats({ snapshot }: { snapshot: PartnerSnapshot }) {
  return <Panel title="Team-Statistik" items={[`Direkte Partner: ${snapshot.team.length}`, `Team-Tickets: ${snapshot.balance.team_tickets_sold}`, `Team-Override pending: ${money(snapshot.referrals.filter((ref) => ref.commission_type === "team_override" && ref.status === "pending").reduce((sum, ref) => sum + ref.commission_cents, 0))}`]} />;
}

export function InvitePartner({ snapshot }: { snapshot: PartnerSnapshot }) {
  return <ToolCard title="Partner einladen" body={`Einladungs-Link: /register?sponsor=${snapshot.partner.referral_code}. Keine Praemie fuer Anwerbung selbst, nur fuer spaetere Ticketverkaeufe.`} />;
}

export function ReferralTools({ snapshot }: { snapshot: PartnerSnapshot }) {
  const code = snapshot.partner.referral_code || defaultCode;
  const slug = snapshot.partner.referral_slug || code.toLowerCase();
  return (
    <section className="shell grid" style={{ marginTop: 24 }}>
      <ToolCard title="Persoenlicher Code" body={`${code} kopieren und beim Ticketkauf angeben lassen.`} />
      <ToolCard title="Persoenlicher Link" body={`partner.hotmess-blkn.app/r/${code} leitet mit Attribution weiter.`} />
      <ToolCard title="QR-Code" body={`QR enthaelt /r/${code}; fuer Flyer, Stories und Visitenkarten nutzbar.`} />
      <ToolCard title="Event-Landingpages" body={`partner.hotmess-blkn.app/${slug}/innsbruck mit Ticket-CTA und Tracking.`} />
    </section>
  );
}

export function ShareTemplates({ snapshot }: { snapshot: PartnerSnapshot }) {
  const code = snapshot.partner.referral_code;
  return <Panel title="Share-Vorlagen" items={[`WhatsApp: Ich bin bei HotMess dabei - Code ${code}`, `Instagram Story: Ticket sichern mit ${code}`, `Telegram: ${mainAppUrl()}/events?ref=${code}`]} />;
}

export function MaterialLibrary({ snapshot }: { snapshot: PartnerSnapshot }) {
  const items = snapshot.materials.map((material) => `${material.title} - ${material.type ?? "Material"} - ${material.description ?? material.url}`);
  return <Panel title="Werbematerial" items={items.length ? items : ["Noch kein freigegebenes Material. Admin kann Material im Hauptdashboard pflegen."]} />;
}

export function PayoutRequest({ snapshot }: { snapshot: PartnerSnapshot }) {
  const complete = snapshot.partner.tax_id && snapshot.partner.iban_encrypted;
  return <ToolCard title="Auszahlung beantragen" body={`${money(snapshot.balance.available_cents)} verfuegbar. Mindestbetrag 50 EUR. ${complete ? "Geschaeftsdaten sind hinterlegt." : "Geschaeftsdaten/IBAN vor Auszahlung vervollstaendigen."}`} />;
}

export function PayoutHistory({ snapshot }: { snapshot: PartnerSnapshot }) {
  const items = snapshot.payouts.map((payout) => `${payout.status} - ${money(payout.amount_cents)} - ${new Date(payout.requested_at).toLocaleDateString("de")}`);
  return <Panel title="Auszahlungs-Historie" items={items.length ? items : ["Noch keine Auszahlung beantragt."]} />;
}

export function TierLadder({ snapshot }: { snapshot: PartnerSnapshot }) {
  return <Panel title="Karrierestufen" items={snapshot.tiers.map((tier) => `${tier.name} ${tier.own_commission_pct}% eigen - ${tier.team_override_pct}% Team - ab ${tier.required_own_sales} Tickets`)} />;
}

export function TierBenefits() {
  return <ToolCard title="Rechtsrahmen" body="Team-Override nur auf echte Team-Ticketverkaeufe und konservativ als 1-Ebenen-Modell vorbereitet. Keine Gebuehr, kein Pflichtkauf, kein Geld fuer reine Anwerbung." />;
}

export function PartnerProfile({ snapshot }: { snapshot: PartnerSnapshot }) {
  const p = snapshot.partner;
  return <Panel title="Partner-Profil" items={[`${p.first_name} ${p.last_name}`, p.email, `Code ${p.referral_code}`, `Status ${p.status}`]} />;
}

export function BusinessData({ snapshot }: { snapshot: PartnerSnapshot }) {
  const p = snapshot.partner;
  return <Panel title="Geschaeftsdaten" items={[`Firma: ${p.business_name ?? "offen"}`, `Steuer/UID: ${p.tax_id ? "hinterlegt" : "offen"}`, `Gewerbeschein: ${p.has_business_license ? "ja" : "offen"}`]} />;
}

export function IbanForm({ snapshot }: { snapshot: PartnerSnapshot }) {
  return <ToolCard title="IBAN" body={snapshot.partner.iban_encrypted ? "IBAN ist verschluesselt hinterlegt und nur fuer Auszahlungen vorgesehen." : "IBAN noch nicht hinterlegt. Vor Auszahlung ergaenzen."} />;
}

export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p className="eyebrow">{mode === "login" ? "Partner Login" : "Kostenlose Registrierung"}</p>
      <h1 className="display" style={{ fontSize: 48, margin: "16px 0" }}>{mode === "login" ? "Einloggen" : "Partner werden"}</h1>
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        {mode === "register" ? <><input placeholder="Vorname" /><input placeholder="Nachname" /><input placeholder="Telefon" /><input placeholder="Sponsor-Code optional" /></> : null}
        <input placeholder="E-Mail" />
        <input placeholder="Passwort" type="password" />
        {mode === "register" ? <label style={{ color: "var(--partner-muted)" }}><input type="checkbox" /> Partnervertrag akzeptieren</label> : null}
        <button className="pill primary" type="button">{mode === "login" ? "Einloggen" : "Kostenlos registrieren"}</button>
      </div>
    </section>
  );
}

export function ReferralRedirect({ code }: { code: string }) {
  return <ToolCard title={`Referral ${code}`} body="Der Klick wird anonymisiert erfasst und danach zur Hauptplattform mit ref-Parameter weitergeleitet." />;
}

export function EventLanding({ code, event }: { code: string; event: string }) {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p className="eyebrow">Persoenliche Event-Landingpage</p>
      <h1 className="display" style={{ fontSize: 56, margin: "16px 0" }}>HotMess {event}</h1>
      <p style={{ color: "var(--partner-muted)" }}>Empfohlen von {code}. Der Ticket-Link traegt die Attribution automatisch.</p>
      <a className="pill primary" href={`${mainAppUrl()}/events/${event}?ref=${code}&utm_source=partner&utm_medium=landing`}>Ticket kaufen</a>
    </section>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="shell card" style={{ padding: 24, marginTop: 20 }}>
      <h2 className="display" style={{ fontSize: 34, marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => <div key={item} className="muted-card">{item}</div>)}
      </div>
    </section>
  );
}

function ToolCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 className="display" style={{ fontSize: 30, margin: 0 }}>{title}</h2>
      <p style={{ color: "var(--partner-muted)", lineHeight: 1.7 }}>{body}</p>
    </section>
  );
}

