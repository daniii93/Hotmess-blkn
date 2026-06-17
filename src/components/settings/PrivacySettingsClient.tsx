"use client";

import { Download, Eye, Lock, Shield, Users } from "lucide-react";
import { useState } from "react";

type PrivacyValues = {
  isPrivate: boolean;
  showFollowers: boolean;
  showFollowing: boolean;
  showEventCount: boolean;
  showOnlineStatus: boolean;
  showProfileVisits: boolean;
};

export function PrivacySettingsClient({ initialValues }: { initialValues: PrivacyValues }) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<string | null>(null);

  const save = async (key: keyof PrivacyValues, value: boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setStatus(response.ok ? "Gespeichert." : "Einstellung konnte nicht gespeichert werden.");
    if (!response.ok) setValues((current) => ({ ...current, [key]: !value }));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Privatsphaere</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Sichtbarkeit steuern</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
          Entscheide, was andere sehen duerfen. Blockierte Konten bleiben in allen Bereichen ausgeschlossen.
        </p>
      </section>

      <SettingsPanel icon={Lock} title="Konto-Sichtbarkeit" detail="Private Konten zeigen Inhalte nur bestaetigten Followern.">
        <Toggle label="Privates Konto" detail="Neue Follower muessen bestaetigt werden." checked={values.isPrivate} onChange={(value) => save("isPrivate", value)} />
      </SettingsPanel>

      <SettingsPanel icon={Users} title="Profilzahlen" detail="Steuere, welche Listen und Zahlen auf deinem Profil sichtbar sind.">
        <Toggle label="Follower sichtbar" detail="Andere koennen deine Follower-Liste oeffnen." checked={values.showFollowers} onChange={(value) => save("showFollowers", value)} />
        <Toggle label="Gefolgt sichtbar" detail="Andere sehen, welchen Profilen du folgst." checked={values.showFollowing} onChange={(value) => save("showFollowing", value)} />
        <Toggle label="Event-Anzahl sichtbar" detail="Zeigt deine besuchten Events als Vertrauenssignal." checked={values.showEventCount} onChange={(value) => save("showEventCount", value)} />
      </SettingsPanel>

      <SettingsPanel icon={Eye} title="Aktivitaetsstatus" detail="Diese Werte wirken auf Chat, Profil und Besuchslisten.">
        <Toggle label="Online-Status zeigen" detail="Freunde sehen, ob du aktiv bist." checked={values.showOnlineStatus} onChange={(value) => save("showOnlineStatus", value)} />
        <Toggle label="Profilbesuche-Liste zeigen" detail="Profilbesuche werden nur angezeigt, wenn du sie selbst erlaubst." checked={values.showProfileVisits} onChange={(value) => save("showProfileVisits", value)} />
      </SettingsPanel>

      <SettingsPanel icon={Download} title="Meine Daten" detail="DSGVO-Export und Kontodaten.">
        <p className="rounded-card bg-hm-ivory p-3 text-sm leading-6 text-hm-inkSoft">
          Der Datenexport ist vorbereitet. Fuer den vollstaendigen Export werden Profil, Tickets, Zahlungen, Chat-Metadaten und Einstellungen gebuendelt.
        </p>
      </SettingsPanel>

      <SettingsPanel icon={Shield} title="Blockierte Konten" detail="Blockierte Nutzer koennen dich nicht sehen, anschreiben oder vorschlagen.">
        <p className="rounded-card bg-hm-ivory p-3 text-sm leading-6 text-hm-inkSoft">
          Die Verwaltung blockierter Konten folgt als eigene Liste. Block-Regeln sind serverseitig bereits in Profil, Feed, Dating, Business und Chat verankert.
        </p>
      </SettingsPanel>

      {status ? <p className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-xl rounded-card bg-hm-ink px-4 py-3 text-sm font-bold text-white shadow-luxury">{status}</p> : null}
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

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      className="flex items-center justify-between gap-4 rounded-xl bg-hm-ivory px-4 py-3 text-left"
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span>
        <span className="block text-sm font-bold text-hm-ink">{label}</span>
        <span className="block text-xs leading-5 text-hm-inkSoft">{detail}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-hm-ink" : "bg-hm-champagne"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
