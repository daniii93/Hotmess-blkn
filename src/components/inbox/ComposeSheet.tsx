"use client";

import { useEffect, useState } from "react";
import { Search, Send } from "lucide-react";

type Person = { id: string; name: string; username: string; avatarUrl: string | null; city: string | null };

export function ComposeSheet({ initialTo }: { initialTo?: string }) {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person[]>([]);
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
      if (response.ok) {
        const payload = await response.json();
        setPeople(payload.people ?? []);
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (initialTo && selected.length === 0) setQuery(initialTo);
  }, [initialTo, selected.length]);

  const send = async () => {
    if (selected.length === 0) return;
    setSending(true);
    setError(null);
    const response = await fetch("/api/chat/conversation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userIds: selected.map((item) => item.id), message, name: selected.length > 1 ? groupName : undefined }),
    });
    const payload = await response.json().catch(() => ({}));
    setSending(false);
    if (response.ok && payload.conversationId) window.location.href = `/chat/${payload.conversationId}`;
    else setError(payload.error ?? "Chat konnte nicht erstellt werden.");
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-4">
      <header className="mb-6">
        <a className="text-sm font-semibold text-hm-goldDeep" href="/chat">Abbrechen</a>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Neue Nachricht</h1>
      </header>
      <section className="rounded-3xl border border-hm-gold/20 bg-hm-porcelain p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-hm-borderSoft pb-3">
          <span className="text-sm font-semibold text-hm-ink">An:</span>
          {selected.map((person) => (
            <button
              className="rounded-full bg-hm-champagne px-3 py-1 text-xs font-bold text-hm-ink"
              key={person.id}
              type="button"
              onClick={() => setSelected((current) => current.filter((item) => item.id !== person.id))}
            >
              {person.name}
            </button>
          ))}
          <input className="min-w-32 flex-1 bg-transparent text-sm outline-none" placeholder="Suchen" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="mt-3 space-y-2">
          {people.map((person) => (
            <button
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-hm-champagne/50"
              key={person.id}
              type="button"
              onClick={() => {
                if (!selected.some((item) => item.id === person.id)) setSelected((current) => [...current, person]);
                setQuery("");
                setPeople([]);
              }}
            >
              <Search className="h-4 w-4 text-hm-goldDeep" />
              <span>
                <span className="block text-sm font-semibold text-hm-ink">{person.name}</span>
                <span className="text-xs text-hm-inkSoft">@{person.username}</span>
              </span>
            </button>
          ))}
        </div>
        {selected.length > 1 ? (
          <input
            className="mt-4 w-full rounded-2xl border border-hm-border bg-hm-ivory p-4 text-sm outline-none focus:border-hm-gold"
            placeholder="Gruppenname (optional)"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            maxLength={80}
          />
        ) : null}
        <textarea
          className="mt-4 min-h-28 w-full rounded-2xl border border-hm-border bg-hm-ivory p-4 text-sm outline-none focus:border-hm-gold"
          placeholder="Erste Nachricht schreiben ..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-hm-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          type="button"
          disabled={selected.length === 0 || sending}
          onClick={() => void send()}
        >
          <Send className="h-4 w-4" />
          {selected.length > 1 ? "Gruppe erstellen" : "Senden"}
        </button>
        {error ? <p className="mt-3 rounded-2xl bg-[#9C4A3C]/10 px-4 py-3 text-sm font-semibold text-[#9C4A3C]">{error}</p> : null}
      </section>
    </main>
  );
}
