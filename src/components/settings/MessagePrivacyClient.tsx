"use client";

import { MessageCircle, Users } from "lucide-react";
import { useState } from "react";

type MessageSetting = "everyone" | "followers" | "off";
type GroupSetting = "everyone" | "followers";

export function MessagePrivacyClient({
  initialWhoCanMessage,
  initialWhoCanAddToGroups,
}: {
  initialWhoCanMessage: MessageSetting;
  initialWhoCanAddToGroups: GroupSetting;
}) {
  const [whoCanMessage, setWhoCanMessage] = useState<MessageSetting>(initialWhoCanMessage);
  const [whoCanAddToGroups, setWhoCanAddToGroups] = useState<GroupSetting>(initialWhoCanAddToGroups);
  const [status, setStatus] = useState<string | null>(null);

  const save = async (next: Partial<{ whoCanMessage: MessageSetting; whoCanAddToGroups: GroupSetting }>) => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    setStatus(response.ok ? "Gespeichert." : "Einstellung konnte nicht gespeichert werden.");
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Nachrichten & Story-Antworten</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Nachrichten-Einstellungen</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Steuere, wer dich anschreiben oder zu Gruppen hinzufuegen kann. Blockierte Konten bleiben immer ausgeschlossen.</p>
      </section>

      <SettingsBlock icon={MessageCircle} title="Message Requests" detail="Personen, denen du folgst, landen direkt im Posteingang. Andere werden je nach Einstellung zu Anfragen oder blockiert.">
        {[
          ["everyone", "Alle koennen Anfragen senden"],
          ["followers", "Nur Personen, denen ich folge"],
          ["off", "Keine neuen Anfragen"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${whoCanMessage === value ? "border-hm-ink bg-hm-ink text-white" : "border-hm-border bg-hm-ivory text-hm-ink"}`}
            type="button"
            onClick={() => {
              const next = value as MessageSetting;
              setWhoCanMessage(next);
              void save({ whoCanMessage: next });
            }}
          >
            {label}
          </button>
        ))}
      </SettingsBlock>

      <SettingsBlock icon={Users} title="Zu Gruppen hinzufuegen" detail="Fremde Gruppen koennen in Anfragen landen. Blockierte Konten koennen dich nie hinzufuegen.">
        {[
          ["everyone", "Alle"],
          ["followers", "Nur Personen, denen ich folge"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${whoCanAddToGroups === value ? "border-hm-ink bg-hm-ink text-white" : "border-hm-border bg-hm-ivory text-hm-ink"}`}
            type="button"
            onClick={() => {
              const next = value as GroupSetting;
              setWhoCanAddToGroups(next);
              void save({ whoCanAddToGroups: next });
            }}
          >
            {label}
          </button>
        ))}
      </SettingsBlock>

      <section className="mt-5 rounded-card border border-[#9C4A3C]/20 bg-red-50/50 p-4 text-sm leading-6 text-hm-inkSoft">
        Spam-Filter und unerwuenschte Begriffe werden ueber die Tabelle <strong>muted_words</strong> vorbereitet. Verdächtige Requests landen ohne Benachrichtigung im Spam-Bereich.
      </section>

      {status ? <p className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-xl rounded-card bg-hm-ink px-4 py-3 text-sm font-bold text-white shadow-luxury">{status}</p> : null}
    </main>
  );
}

function SettingsBlock({ icon: Icon, title, detail, children }: { icon: any; title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-soft">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-hm-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-hm-inkSoft">{detail}</p>
        </div>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
