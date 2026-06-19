"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Search, Send, UserPlus, UsersRound, X } from "lucide-react";

type Person = { id: string; name: string; username: string; avatarUrl: string | null; city: string | null };
type ConversationResult = { id: string; type: string; name: string; preview: string; lastMessageAt: string | null };

export function ComposeSheet({ initialTo }: { initialTo?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [conversations, setConversations] = useState<ConversationResult[]>([]);
  const [selected, setSelected] = useState<Person[]>([]);
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const term = query.trim();
    if (term.length < 2) {
      setPeople([]);
      setConversations([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/chat/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Suche fehlgeschlagen.");
        setPeople(payload.people ?? []);
        setConversations(payload.conversations ?? []);
        setSearched(true);
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setPeople([]);
          setConversations([]);
          setSearched(true);
          setError(searchError instanceof Error ? searchError.message : "Suche fehlgeschlagen.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
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
      body: JSON.stringify({ userIds: selected.map((item) => item.id), message: message.trim(), name: selected.length > 1 ? groupName : undefined }),
    });
    const payload = await response.json().catch(() => ({}));
    setSending(false);
    if (response.ok && payload.conversationId) router.push(`/chat/${payload.conversationId}`);
    else setError(payload.error ?? "Chat konnte nicht erstellt werden.");
  };

  const canSend = selected.length > 0 && message.trim().length > 0 && !sending;
  const showEmpty = searched && !loading && query.trim().length >= 2 && people.length === 0 && conversations.length === 0 && !error;

  return (
    <main className="mx-auto min-h-[calc(100dvh-6rem)] w-full max-w-3xl overflow-x-hidden px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4">
      <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-hm-goldDeep" href="/chat">
            <ArrowLeft className="h-4 w-4" /> Zur Inbox
          </Link>
          <h1 className="hm-display mt-3 text-3xl text-hm-ink sm:text-4xl">Neue Nachricht</h1>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
            Suche verifizierte Mitglieder, oeffne bestehende Chats oder starte eine neue Anfrage.
          </p>
        </div>
        <Link className="w-fit rounded-pill border border-hm-border px-4 py-2 text-xs font-bold text-hm-inkSoft hover:border-hm-gold hover:text-hm-ink" href="/chat/requests">
          Anfragen
        </Link>
      </header>
      <section className="w-full rounded-[1.35rem] border border-hm-gold/20 bg-hm-porcelain p-3 shadow-sm sm:rounded-3xl sm:p-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-hm-borderSoft pb-3 focus-within:border-hm-gold">
          <span className="shrink-0 text-sm font-semibold text-hm-ink">An:</span>
          {selected.map((person) => (
            <button
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-hm-champagne px-3 py-1 text-xs font-bold text-hm-ink"
              key={person.id}
              type="button"
              aria-label={`${person.name} entfernen`}
              onClick={() => setSelected((current) => current.filter((item) => item.id !== person.id))}
            >
              <span className="max-w-[11rem] truncate">{person.name}</span>
              <X className="h-3 w-3 shrink-0" />
            </button>
          ))}
          <div className="flex min-w-0 flex-[1_1_12rem] items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-hm-goldDeep" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Name oder @username suchen"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Empfaenger suchen"
            />
            {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-hm-goldDeep" /> : null}
          </div>
        </div>

        {query.trim().length > 0 && query.trim().length < 2 ? (
          <p className="mt-3 rounded-2xl bg-hm-ivory px-4 py-3 text-xs font-semibold text-hm-inkSoft">
            Gib mindestens 2 Zeichen ein, um Mitglieder oder bestehende Chats zu finden.
          </p>
        ) : null}

        <div className="mt-3 space-y-2">
          {conversations.length > 0 ? (
            <div className="grid gap-2">
              <p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-hm-inkSoft">Bestehende Chats</p>
              {conversations.map((conversation) => (
                <button
                  className="flex w-full items-center gap-3 rounded-2xl border border-hm-border/70 p-3 text-left hover:border-hm-gold hover:bg-hm-champagne/40"
                  key={conversation.id}
                  type="button"
                  onClick={() => router.push(`/chat/${conversation.id}`)}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-hm-ink text-white">
                    {conversation.type === "group" ? <UsersRound className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-hm-ink">{conversation.name}</span>
                    <span className="block truncate text-xs text-hm-inkSoft">{conversation.preview}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {people.length > 0 ? <p className="px-1 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-hm-inkSoft">Mitglieder</p> : null}
          {people.map((person) => (
            <button
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-hm-champagne/50 disabled:cursor-not-allowed disabled:opacity-50"
              key={person.id}
              type="button"
              disabled={selected.some((item) => item.id === person.id)}
              onClick={() => {
                if (!selected.some((item) => item.id === person.id)) setSelected((current) => [...current, person]);
                setQuery("");
                setPeople([]);
                setConversations([]);
                setSearched(false);
              }}
            >
              <Avatar person={person} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-hm-ink">{person.name}</span>
                <span className="block truncate text-xs text-hm-inkSoft">@{person.username}{person.city ? ` - ${person.city}` : ""}</span>
              </span>
              <UserPlus className="h-4 w-4 shrink-0 text-hm-goldDeep" />
            </button>
          ))}
        </div>

        {showEmpty ? (
          <div className="mt-4 rounded-2xl border border-dashed border-hm-border bg-hm-ivory px-4 py-6 text-center">
            <p className="text-sm font-bold text-hm-ink">Keine passenden Kontakte gefunden.</p>
            <p className="mt-1 text-xs text-hm-inkSoft">Blockierte, gesperrte oder nicht verifizierte Konten werden nicht angezeigt.</p>
          </div>
        ) : null}

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
          maxLength={1000}
          onChange={(event) => setMessage(event.target.value)}
          aria-label="Erste Nachricht"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-hm-inkSoft">
          <span>{selected.length ? `${selected.length} Empfaenger ausgewaehlt` : "Waehle mindestens einen Empfaenger."}</span>
          <span>{message.trim().length}/1000</span>
        </div>
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-hm-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto"
          type="button"
          disabled={!canSend}
          onClick={() => void send()}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {selected.length > 1 ? "Gruppe erstellen & senden" : "Nachricht senden"}
        </button>
        {error ? <p className="mt-3 rounded-2xl bg-[#9C4A3C]/10 px-4 py-3 text-sm font-semibold text-[#9C4A3C]">{error}</p> : null}
      </section>
    </main>
  );
}

function Avatar({ person }: { person: Person }) {
  const initials = person.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || person.username.slice(0, 2).toUpperCase();

  if (person.avatarUrl) {
    return <img src={person.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />;
  }

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-hm-champagne text-xs font-black text-hm-ink">
      {initials}
    </span>
  );
}
