"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type SearchResult = {
  people: Array<{ id: string; name: string; username: string; avatarUrl: string | null; city: string | null }>;
  conversations: Array<{ id: string; name: string | null; last_message_preview: string | null }>;
};

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

export function InboxSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ people: [], conversations: [] });

  useEffect(() => {
    const controller = new AbortController();
    if (query.trim().length < 2) {
      setResults({ people: [], conversations: [] });
      return;
    }

    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
      if (response.ok) setResults(await response.json());
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-full bg-hm-champagne/80 px-4 py-3 text-hm-inkSoft">
        <Search className="h-4 w-4" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-hm-inkSoft"
          placeholder="Suchen ..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-2xl border border-hm-gold/20 bg-hm-porcelain shadow-luxury">
          {results.people.length === 0 && results.conversations.length === 0 ? (
            <p className="p-4 text-sm text-hm-inkSoft">Keine Treffer.</p>
          ) : null}
          {results.people.map((person) => (
            <Link className="flex items-center gap-3 border-b border-hm-borderSoft p-3" href={`/u/${person.username}`} key={person.id}>
              <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-hm-champagne text-sm font-bold text-hm-ink">
                {person.avatarUrl ? <img alt={person.name} className="h-full w-full object-cover" src={person.avatarUrl} /> : initials(person.name)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-hm-ink">{person.name}</span>
                <span className="text-xs text-hm-inkSoft">@{person.username}</span>
              </span>
            </Link>
          ))}
          {results.conversations.map((conversation) => (
            <Link className="block border-b border-hm-borderSoft p-3" href={`/chat/${conversation.id}`} key={conversation.id}>
              <span className="block text-sm font-semibold text-hm-ink">{conversation.name || "Chat"}</span>
              <span className="text-xs text-hm-inkSoft">{conversation.last_message_preview || "Unterhaltung oeffnen"}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
