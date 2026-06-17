import Link from "next/link";
import { LifeBuoy, LockKeyhole, Mail, ShieldAlert } from "lucide-react";

export default function SupportSettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Hilfe & Support</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Wir bringen dich wieder rein</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
          Hilfe fuer Login, Zahlungen, Tickets, Verifizierung und Sicherheit.
        </p>
      </section>

      <SettingsPanel icon={LockKeyhole} title="Login oder Konto wechseln" detail="Wenn du zwischen Testkunde und Admin wechseln willst.">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-hm-inkSoft">
          <li>Profil unten rechts oeffnen.</li>
          <li>Oben links Einstellungen oeffnen.</li>
          <li>Ganz nach unten zu Sitzung scrollen.</li>
          <li>Abmelden antippen und im Dialog bestaetigen.</li>
        </ol>
      </SettingsPanel>

      <SettingsPanel icon={ShieldAlert} title="Konto gehackt oder verdaechtig" detail="Sofortmassnahmen.">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-hm-inkSoft">
          <li>Passwort aendern.</li>
          <li>Aktive Sitzungen in Passwort & 2FA pruefen.</li>
          <li>Backup-Codes neu erstellen.</li>
          <li>Support mit deiner verifizierten E-Mail kontaktieren.</li>
        </ul>
      </SettingsPanel>

      <SettingsPanel icon={Mail} title="Kontakt" detail="Support-Adresse fuer Startphase.">
        <a className="rounded-xl bg-hm-ink px-4 py-3 text-center text-sm font-bold text-white" href="mailto:online@braungruppe.at">
          online@braungruppe.at
        </a>
      </SettingsPanel>

      <SettingsPanel icon={LifeBuoy} title="Rechtliches" detail="AGB, Datenschutz und Impressum.">
        <Link className="rounded-xl bg-hm-ivory px-4 py-3 text-sm font-bold text-hm-ink" href="/agb">AGB</Link>
        <Link className="rounded-xl bg-hm-ivory px-4 py-3 text-sm font-bold text-hm-ink" href="/datenschutz">Datenschutz</Link>
        <Link className="rounded-xl bg-hm-ivory px-4 py-3 text-sm font-bold text-hm-ink" href="/impressum">Impressum</Link>
      </SettingsPanel>
    </main>
  );
}

function SettingsPanel({ icon: Icon, title, detail, children }: { icon: any; title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-soft">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-hm-ink">{title}</h2>
          <p className="mt-1 text-sm text-hm-inkSoft">{detail}</p>
        </div>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
