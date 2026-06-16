"use client";

import { useState } from "react";
import { Ban, Check, Trash2 } from "lucide-react";
import type { MessageRequestItem } from "@/features/inbox/live-service";

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

export function RequestsList({ requests }: { requests: MessageRequestItem[] }) {
  const [items, setItems] = useState(requests);

  const act = async (requestId: string, action: "accept" | "delete" | "block") => {
    const response = await fetch("/api/chat/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && action === "accept" && payload.conversationId) {
      window.location.href = `/chat/${payload.conversationId}`;
      return;
    }
    if (response.ok) setItems((current) => current.filter((item) => item.id !== requestId));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-4">
      <header className="mb-6">
        <a className="text-sm font-semibold text-hm-goldDeep" href="/chat">Zurueck</a>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Anfragen</h1>
        <p className="mt-2 text-sm text-hm-inkSoft">Nachrichten von Nicht-Freunden landen zuerst hier.</p>
      </header>
      {items.length === 0 ? (
        <section className="rounded-3xl border border-hm-gold/20 bg-hm-porcelain p-8 text-center">
          <p className="font-semibold text-hm-ink">Keine Anfragen</p>
          <p className="mt-2 text-sm text-hm-inkSoft">Alles sauber. Neue Chat-Anfragen erscheinen hier.</p>
        </section>
      ) : (
        <section className="space-y-3">
          {items.map((request) => (
            <article className="rounded-3xl border border-hm-gold/20 bg-hm-porcelain p-4 shadow-sm" key={request.id}>
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center overflow-hidden rounded-full bg-hm-champagne font-bold text-hm-ink">
                  {request.from?.avatarUrl ? <img alt={request.from.name} className="h-full w-full object-cover" src={request.from.avatarUrl} /> : initials(request.from?.name ?? "H")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-hm-ink">{request.from?.name ?? "Nicht verfuegbares Konto"}</p>
                  <p className="truncate text-sm text-hm-inkSoft">{request.preview} · {request.timeLabel}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="rounded-full bg-hm-ink px-3 py-2 text-sm font-bold text-white" type="button" onClick={() => void act(request.id, "accept")}>
                  <Check className="mx-auto h-4 w-4" />
                </button>
                <button className="rounded-full border border-hm-gold/40 px-3 py-2 text-sm font-bold text-hm-ink" type="button" onClick={() => void act(request.id, "delete")}>
                  <Trash2 className="mx-auto h-4 w-4" />
                </button>
                <button className="rounded-full border border-[#9C4A3C]/40 px-3 py-2 text-sm font-bold text-[#9C4A3C]" type="button" onClick={() => void act(request.id, "block")}>
                  <Ban className="mx-auto h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
