import Link from "next/link";

const kpis = [
  ["Verfuegbar", "342 EUR", "Auszahlen"],
  ["Ausstehend", "128 EUR", "nach Event bestaetigt"],
  ["Diese Stufe", "Influencer", "6% eigen"],
  ["Verkaeufe gesamt", "47 Tickets", "38 eigen / 9 Team"]
];

export function Hero() {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p style={{ color: "var(--partner-gold)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Kostenloses Empfehlungsmarketing</p>
      <h1 className="display" style={{ fontSize: "clamp(42px, 8vw, 82px)", lineHeight: 1, margin: "20px 0" }}>Tickets verkaufen. Fair Provision verdienen.</h1>
      <p style={{ maxWidth: 720, color: "var(--partner-muted)", lineHeight: 1.8 }}>
        Partner verdienen nur an echten HotMess Ticketverkaeufen. Keine Eintrittsgebuehr, kein Pflichtkauf, keine Provision fuer reine Anwerbung.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
        <Link className="pill" href="/register" style={{ background: "var(--partner-ink)", color: "white", padding: "14px 20px", fontWeight: 700 }}>Partner werden</Link>
        <Link className="pill" href="/login" style={{ border: "1px solid var(--partner-gold)", padding: "14px 20px", fontWeight: 700 }}>Einloggen</Link>
      </div>
    </section>
  );
}

export function LegalGuardrails() {
  const rules = ["Provision nur auf echte Ticketverkaeufe", "Teilnahme kostenlos", "Kein Geld fuer reines Anwerben", "Jederzeit kuendbar", "Anwalts- und Steuerpruefung vor Launch"];
  return (
    <section className="shell" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 20 }}>
      {rules.map((rule) => <div className="card" key={rule} style={{ padding: 18, color: "var(--partner-muted)" }}>{rule}</div>)}
    </section>
  );
}

export function PartnerKpis() {
  return (
    <section className="shell" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", marginTop: 24 }}>
      {kpis.map(([label, value, hint]) => (
        <div className="card" key={label} style={{ padding: 22 }}>
          <p style={{ color: "var(--partner-gold)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "12px 0 4px" }}>{value}</p>
          <p style={{ color: "var(--partner-muted)" }}>{hint}</p>
        </div>
      ))}
    </section>
  );
}

export function TierProgress() {
  return (
    <section className="shell card" style={{ padding: 24, marginTop: 20 }}>
      <p style={{ fontWeight: 700 }}>Aufstieg Influencer zu Manager</p>
      <div style={{ height: 12, background: "#efe7da", borderRadius: 999, overflow: "hidden", marginTop: 12 }}>
        <div style={{ width: "51%", height: "100%", background: "var(--partner-gold)" }} />
      </div>
      <p style={{ color: "var(--partner-muted)" }}>38/75 Tickets, noch 37 bis zur naechsten Stufe.</p>
    </section>
  );
}

export function ActivityFeed() {
  return <Panel title="Letzte Aktivitaet" items={["Verkauf: HotMess Innsbruck +1,50 EUR", "Team-Verkauf von Marko +0,30 EUR", "Neue Stufe erreicht: Influencer"]} />;
}

export function SalesHistory() {
  return <Panel title="Verkaufs-Historie" items={["Eigenverkauf · Ticket Innsbruck · pending · +1,50 EUR", "Team-Override · Marko · confirmed · +0,30 EUR", "Storno · Ticket Wien · reversed"]} />;
}

export function TeamTree() {
  return <Panel title="Dein Team" items={["Marko · Promoter · 12 Tickets · du +3,60 EUR", "Lena · Starter · 3 Tickets · du +0,90 EUR"]} />;
}

export function TeamStats() {
  return <Panel title="Team-Statistik" items={["Direkte Partner: 5", "Team-Umsatz: 225 EUR", "Override: 6,75 EUR"]} />;
}

export function InvitePartner() {
  return <ToolCard title="Partner einladen" body="Einladungs-Link mit Sponsor-ID. Keine Praemie fuer Anwerbung selbst, nur fuer spaetere Ticketverkaeufe." />;
}

export function ReferralTools() {
  return (
    <section className="shell" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 24 }}>
      <ToolCard title="Persoenlicher Code" body="ANA2024 kopieren und beim Ticketkauf angeben lassen." />
      <ToolCard title="Persoenlicher Link" body="partner.hotmess-blkn.app/r/ana2024 leitet mit Attribution weiter." />
      <ToolCard title="QR-Code" body="QR fuer Flyer, Stories und Visitenkarten herunterladen." />
      <ToolCard title="Event-Landingpages" body="partner.hotmess-blkn.app/ana2024/innsbruck mit Ticket-CTA." />
    </section>
  );
}

export function ShareTemplates() {
  return <Panel title="Share-Vorlagen" items={["WhatsApp Caption", "Instagram Story Text", "Telegram Kurztext"]} />;
}

export function MaterialLibrary() {
  return <Panel title="Werbematerial" items={["Event-Grafik 4:5", "Story-Vorlage 9:16", "Flyer PDF", "HotMess Logo-Paket"]} />;
}

export function PayoutRequest() {
  return <ToolCard title="Auszahlung beantragen" body="Mindestbetrag 50 EUR. Nur confirmed Provisionen, Geschaeftsdaten und Rechnung/Gutschrift erforderlich." />;
}

export function PayoutHistory() {
  return <Panel title="Auszahlungs-Historie" items={["requested · 342 EUR", "paid · 180 EUR · Referenz HM-PAY-001"]} />;
}

export function TierLadder() {
  return <Panel title="Karrierestufen" items={["Starter 2% · ab 0 Tickets", "Promoter 4% · ab 10", "Influencer 6% + 1% Team · ab 30", "Manager 8% + 2% Team · ab 75", "Director 10% + 3% Team · ab 150", "Partner 12% + 4% Team · ab 300"]} />;
}

export function TierBenefits() {
  return <ToolCard title="Rechtsrahmen" body="Team-Override nur auf echte Team-Ticketverkaeufe und konservativ als 1-Ebenen-Modell vorbereitet." />;
}

export function PartnerProfile() {
  return <Panel title="Partner-Profil" items={["Name, E-Mail, Telefon", "Referral Code und Slug", "Status active/pending"]} />;
}

export function BusinessData() {
  return <Panel title="Geschaeftsdaten" items={["Firmenname", "Steuernummer/UID", "Gewerbeschein", "Rechnungsdaten"]} />;
}

export function IbanForm() {
  return <ToolCard title="IBAN" body="IBAN wird nur verschluesselt gespeichert und fuer Auszahlungen verwendet." />;
}

export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p style={{ color: "var(--partner-gold)", fontWeight: 700, textTransform: "uppercase", fontSize: 12 }}>{mode === "login" ? "Partner Login" : "Kostenlose Registrierung"}</p>
      <h1 className="display" style={{ fontSize: 48, margin: "16px 0" }}>{mode === "login" ? "Einloggen" : "Partner werden"}</h1>
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        {mode === "register" ? <><input placeholder="Vorname" /><input placeholder="Nachname" /><input placeholder="Telefon" /></> : null}
        <input placeholder="E-Mail" />
        <input placeholder="Passwort" type="password" />
        <button className="pill" style={{ background: "var(--partner-ink)", color: "white", border: 0, padding: 14, fontWeight: 700 }}>{mode === "login" ? "Einloggen" : "Kostenlos registrieren"}</button>
      </div>
    </section>
  );
}

export function ReferralRedirect({ code }: { code: string }) {
  return <ToolCard title={`Referral ${code}`} body="Diese Seite erfasst den Klick anonymisiert und leitet zur Hauptplattform mit ref-Parameter weiter." />;
}

export function EventLanding({ code, event }: { code: string; event: string }) {
  return (
    <section className="shell card" style={{ padding: 32, marginTop: 24 }}>
      <p style={{ color: "var(--partner-gold)", fontWeight: 700, textTransform: "uppercase", fontSize: 12 }}>Persoenliche Event-Landingpage</p>
      <h1 className="display" style={{ fontSize: 56, margin: "16px 0" }}>HotMess {event}</h1>
      <p style={{ color: "var(--partner-muted)" }}>Empfohlen von {code}. Der Ticket-Link traegt die Attribution automatisch.</p>
      <a className="pill" href={`https://hotmess-blkn.app/events/${event}?ref=${code}`} style={{ display: "inline-flex", marginTop: 24, background: "var(--partner-ink)", color: "white", padding: "14px 20px", fontWeight: 700 }}>Ticket kaufen</a>
    </section>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="shell card" style={{ padding: 24, marginTop: 20 }}>
      <h2 className="display" style={{ fontSize: 34, marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => <div key={item} style={{ border: "1px solid var(--partner-line)", borderRadius: 14, padding: 14, color: "var(--partner-muted)" }}>{item}</div>)}
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
