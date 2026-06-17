"use client";

import { Bell, Clock, MessageCircle, Ticket } from "lucide-react";
import { useState } from "react";

export type NotificationSettingsValues = {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  followRequests: boolean;
  chat: boolean;
  eventUpdates: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
};

export function NotificationSettingsClient({ initialValues }: { initialValues: NotificationSettingsValues }) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<string | null>(null);

  const save = async (key: keyof NotificationSettingsValues, value: boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
    const response = await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setStatus(response.ok ? "Gespeichert." : "Benachrichtigung konnte nicht gespeichert werden.");
    if (!response.ok) setValues((current) => ({ ...current, [key]: !value }));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Benachrichtigungen</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Was dich zurueckholt</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
          Diese Einstellungen steuern In-App, Push und E-Mail, soweit der jeweilige Kanal aktiviert ist.
        </p>
      </section>

      <SettingsPanel icon={Bell} title="Kanaele" detail="Push braucht Browser-Erlaubnis; E-Mail ist fuer wichtige Vorgänge aktiv.">
        <Toggle label="Push erlauben" detail="Live-Hinweise fuer Chat, Tickets und Events." checked={values.pushEnabled} onChange={(value) => save("pushEnabled", value)} />
        <Toggle label="E-Mail erlauben" detail="Wichtige Mails fuer Tickets, Warteliste und Verifizierung." checked={values.emailEnabled} onChange={(value) => save("emailEnabled", value)} />
      </SettingsPanel>

      <SettingsPanel icon={MessageCircle} title="Chat & Social" detail="Likes, Kommentare, Follows und Nachrichten.">
        <Toggle label="Nachrichten" detail="Neue Chats, Antworten und Anfragen." checked={values.chat} onChange={(value) => save("chat", value)} />
        <Toggle label="Likes" detail="Wenn jemand deine Beitraege mag." checked={values.likes} onChange={(value) => save("likes", value)} />
        <Toggle label="Kommentare" detail="Kommentare und Antworten auf deine Inhalte." checked={values.comments} onChange={(value) => save("comments", value)} />
        <Toggle label="Neue Follower" detail="Folgen, Freundschaften und Follow-Backs." checked={values.follows} onChange={(value) => save("follows", value)} />
        <Toggle label="Follow-Anfragen" detail="Anfragen fuer private Konten." checked={values.followRequests} onChange={(value) => save("followRequests", value)} />
      </SettingsPanel>

      <SettingsPanel icon={Ticket} title="Events & Tickets" detail="Ticketkauf, Warteliste, Reminder und Event-Updates.">
        <Toggle label="Event-Updates" detail="Neue Events, Warteliste, Reminder und Ticketinfos." checked={values.eventUpdates} onChange={(value) => save("eventUpdates", value)} />
      </SettingsPanel>

      <SettingsPanel icon={Clock} title="Nicht-Stoeren" detail="Feiner Zeitplan folgt; wichtige Ticket-Mails bleiben sichtbar.">
        <p className="rounded-card bg-hm-ivory p-3 text-sm leading-6 text-hm-inkSoft">
          Nicht-Stoeren ist als Produktlogik vorbereitet. Bis die Zeitfenster live geschaltet sind, kannst du Push global ausschalten.
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
