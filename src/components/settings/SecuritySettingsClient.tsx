"use client";

import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, Smartphone, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";

type BackupCode = { id: string; used: boolean; used_at: string | null; created_at: string };
type SessionRow = { id: string; device_label: string | null; last_seen_at: string; created_at: string; is_trusted?: boolean; trusted_at?: string | null };

export function SecuritySettingsClient() {
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", repeatPassword: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [freshCodes, setFreshCodes] = useState<string[]>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  const loadSecurityData = async () => {
    const [codesResponse, sessionsResponse] = await Promise.all([
      fetch("/api/settings/backup-codes").catch(() => null),
      fetch("/api/settings/sessions").catch(() => null),
    ]);
    const codesPayload = codesResponse ? await codesResponse.json().catch(() => null) as { codes?: BackupCode[] } | null : null;
    const sessionsPayload = sessionsResponse ? await sessionsResponse.json().catch(() => null) as { sessions?: SessionRow[] } | null : null;
    setBackupCodes(codesPayload?.codes ?? []);
    setSessions(sessionsPayload?.sessions ?? []);
  };

  useEffect(() => {
    void loadSecurityData();
  }, []);

  const changePassword = async () => {
    setStatus(null);
    if (password.newPassword !== password.repeatPassword) {
      setStatus("Die neuen Passwoerter stimmen nicht ueberein.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: password.currentPassword, newPassword: password.newPassword }),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setStatus(payload?.error ?? "Passwort konnte nicht geaendert werden.");
      return;
    }
    setPassword({ currentPassword: "", newPassword: "", repeatPassword: "" });
    setStatus("Passwort geaendert. Du bekommst eine Sicherheitsbestaetigung.");
  };

  const generateCodes = async () => {
    setLoading(true);
    const response = await fetch("/api/settings/backup-codes", { method: "POST" });
    const payload = await response.json().catch(() => null) as { codes?: string[]; error?: string } | null;
    setLoading(false);
    if (!response.ok || !payload?.codes) {
      setStatus(payload?.error ?? "Backup-Codes konnten nicht erstellt werden.");
      return;
    }
    setFreshCodes(payload.codes);
    await loadSecurityData();
  };

  const removeSession = async (id: string) => {
    await fetch("/api/settings/sessions", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadSecurityData();
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Passwort & Sicherheit</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Schuetze dein HotMess Konto</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Keine Meta-Konten, keine Facebook-Syncs: alles laeuft ueber deine HotMess-Einstellungen und dein verifiziertes Konto.</p>
      </section>

      <SettingsPanel icon={KeyRound} title="Passwort aendern" detail="Mindestens 8 Zeichen, ein Grossbuchstabe und eine Zahl.">
        <div className="grid gap-3">
          <PasswordField label="Aktuelles Passwort" value={password.currentPassword} onChange={(value) => setPassword((current) => ({ ...current, currentPassword: value }))} />
          <PasswordField label="Neues Passwort" value={password.newPassword} onChange={(value) => setPassword((current) => ({ ...current, newPassword: value }))} />
          <PasswordField label="Neues Passwort wiederholen" value={password.repeatPassword} onChange={(value) => setPassword((current) => ({ ...current, repeatPassword: value }))} />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-hm-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-60" type="button" disabled={loading} onClick={changePassword}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Passwort aendern
          </button>
        </div>
      </SettingsPanel>

      <SettingsPanel icon={ShieldCheck} title="Zwei-Faktor-Authentifizierung" detail="Authenticator, SMS und WhatsApp sind vorbereitet; Backup-Codes funktionieren schon.">
        <div className="grid gap-3 text-sm text-hm-inkSoft">
          <p className="rounded-card bg-hm-champagne/45 p-3">Authenticator-App ist empfohlen. Die Aktivierung nutzt spaeter Supabase MFA; bis dahin kannst du Backup-Codes fuer Recovery vorbereiten.</p>
          <button className="rounded-xl bg-hm-gold px-4 py-3 text-sm font-bold text-hm-ink disabled:opacity-60" type="button" disabled={loading} onClick={generateCodes}>
            Neue Backup-Codes erstellen
          </button>
          {freshCodes.length ? (
            <div className="rounded-card border border-hm-gold/30 bg-hm-ivory p-4">
              <p className="font-bold text-hm-ink">Diese Codes werden nur einmal angezeigt.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-hm-ink">
                {freshCodes.map((code) => <span key={code} className="rounded bg-white px-2 py-1">{code}</span>)}
              </div>
            </div>
          ) : null}
          <p>{backupCodes.filter((code) => !code.used).length} aktive Backup-Codes gespeichert.</p>
        </div>
      </SettingsPanel>

      <SettingsPanel icon={Smartphone} title="Vertrauenswuerdige Geraete" detail="Entferne fremde oder alte Sitzungen. Vertraue niemals oeffentlichen Geraeten.">
        <div className="grid gap-2">
          {sessions.length ? sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-3 rounded-card bg-hm-ivory p-3">
              <Smartphone className="h-5 w-5 text-hm-goldDeep" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-hm-ink">{session.device_label || "HotMess Sitzung"}</p>
                <p className="text-xs text-hm-inkSoft">Zuletzt aktiv: {new Date(session.last_seen_at).toLocaleString("de-DE")}</p>
              </div>
              <button className="rounded-pill bg-hm-champagne px-3 py-1 text-xs font-bold text-hm-ink" type="button" onClick={() => removeSession(session.id)}>Entfernen</button>
            </div>
          )) : <p className="text-sm text-hm-inkSoft">Noch keine gespeicherten Sitzungen vorhanden.</p>}
        </div>
      </SettingsPanel>

      <SettingsPanel icon={TicketCheck} title="Konto kompromittiert?" detail="Sofort handeln, wenn dir etwas komisch vorkommt.">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-hm-inkSoft">
          <li>Passwort sofort aendern.</li>
          <li>Alte Sitzungen entfernen und ueberall abmelden.</li>
          <li>2FA und Backup-Codes aktivieren.</li>
          <li>Support kontaktieren; HotMess kann deine Stripe-Identity-Verifizierung fuer Recovery nutzen.</li>
        </ul>
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
      {children}
    </section>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2 text-sm font-semibold text-hm-ink">
      {label}
      <span className="relative block">
        <input
          className="w-full rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 pr-12 outline-none focus:border-hm-gold"
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={label.toLowerCase().includes("aktuell") ? "current-password" : "new-password"}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-2 grid min-h-11 min-w-11 place-items-center rounded-full text-hm-inkSoft outline-none transition hover:text-hm-ink focus-visible:ring-2 focus-visible:ring-hm-gold"
          aria-label={visible ? `${label} ausblenden` : `${label} anzeigen`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
