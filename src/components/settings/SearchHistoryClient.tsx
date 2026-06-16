"use client";

import { Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type SearchEntry = {
  id: string;
  query: string;
  category: string | null;
  searched_at: string;
};

export function SearchHistoryClient() {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const loadEntries = async () => {
    const response = await fetch("/api/settings/search-history").catch(() => null);
    const payload = response ? await response.json().catch(() => null) as { entries?: SearchEntry[] } | null : null;
    setEntries(payload?.entries ?? []);
  };

  useEffect(() => {
    void loadEntries();
  }, []);

  const remove = async (id?: string) => {
    await fetch("/api/settings/search-history", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    setStatus(id ? "Eintrag entfernt." : "Suchverlauf geloescht.");
    await loadEntries();
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Deine Informationen</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Suchverlauf</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Entferne einzelne Suchen oder loesche alles. Wenn du erneut suchst, kann der Begriff wieder erscheinen.</p>
      </section>

      <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-3 shadow-soft">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <h2 className="font-serif text-2xl font-semibold text-hm-ink">Letzte Suchen</h2>
          <button className="rounded-pill bg-hm-champagne px-4 py-2 text-sm font-bold text-hm-ink disabled:opacity-50" type="button" disabled={!entries.length} onClick={() => remove()}>
            Alle loeschen
          </button>
        </div>
        <div className="mt-2 grid gap-2">
          {entries.length ? entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-hm-champagne/35">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink"><Search className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-hm-ink">{entry.query}</span>
                <span className="block text-xs text-hm-inkSoft">{entry.category ?? "Suche"} · {new Date(entry.searched_at).toLocaleString("de-DE")}</span>
              </span>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#9C4A3C] hover:bg-red-50" type="button" aria-label="Suche entfernen" onClick={() => remove(entry.id)}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )) : <p className="rounded-card bg-hm-ivory p-4 text-sm text-hm-inkSoft">Noch kein Suchverlauf vorhanden.</p>}
        </div>
      </section>

      {status ? <p className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-xl rounded-card bg-hm-ink px-4 py-3 text-sm font-bold text-white shadow-luxury">{status}</p> : null}
    </main>
  );
}
