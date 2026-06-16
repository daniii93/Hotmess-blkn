"use client";

import { useMemo, useState } from "react";
import { Mic, PhoneOff, Plus, Shield, UserMinus, UserPlus, Video, Volume2, VolumeX } from "lucide-react";
import type { ChatThreadMeta } from "@/features/social/live-service";

type Person = { id: string; name: string; username: string; avatarUrl: string | null; city: string | null };

const action = async (conversationId: string, body: Record<string, unknown>) => {
  const response = await fetch(`/api/chat/groups/${conversationId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Aktion fehlgeschlagen.");
  return payload;
};

export function GroupInfoPanel({ meta }: { meta: ChatThreadMeta }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(meta.name);
  const [nickname, setNickname] = useState(meta.members.find((member) => member.mine)?.nickname ?? "");
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const isAdmin = meta.currentUserRole === "admin";
  const existingIds = useMemo(() => new Set(meta.members.map((member) => member.id)), [meta.members]);

  const run = async (body: Record<string, unknown>, success: string) => {
    setBusy(true);
    setStatus(null);
    try {
      await action(meta.id, body);
      setStatus(success);
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Aktion fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const searchPeople = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setPeople([]);
      return;
    }
    const response = await fetch(`/api/chat/search?q=${encodeURIComponent(value.trim())}`);
    if (!response.ok) return;
    const payload = await response.json();
    setPeople((payload.people ?? []).filter((person: Person) => !existingIds.has(person.id)));
  };

  const startCall = async (type: "audio" | "video") => {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/chat/calls", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: meta.id, type }),
      });
      const payload = await response.json().catch(() => ({}));
      setStatus(payload.error ?? "Anruf gestartet.");
    } finally {
      setBusy(false);
    }
  };

  if (!meta.isGroupLike) return null;

  return (
    <div className="mt-4 rounded-3xl border border-hm-gold/20 bg-hm-ivory p-3">
      <button className="flex w-full items-center justify-between gap-3 text-left" type="button" onClick={() => setOpen((current) => !current)}>
        <span>
          <span className="block text-sm font-bold text-hm-ink">Gruppeninfo</span>
          <span className="text-xs text-hm-inkSoft">{meta.memberCount} Mitglieder · {isAdmin ? "Du bist Admin" : "Mitglied"}</span>
        </span>
        <span className="rounded-full border border-hm-gold px-3 py-1 text-xs font-bold text-hm-goldDeep">{open ? "Schliessen" : "Oeffnen"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="rounded-2xl border border-hm-border bg-hm-porcelain px-4 py-3 text-sm outline-none focus:border-hm-gold"
              disabled={!isAdmin}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Gruppenname"
            />
            <button
              className="rounded-full bg-hm-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              type="button"
              disabled={!isAdmin || busy || name.trim() === meta.name}
              onClick={() => void run({ action: "rename", name }, "Gruppe umbenannt.")}
            >
              Speichern
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="rounded-2xl border border-hm-border bg-hm-porcelain px-4 py-3 text-sm outline-none focus:border-hm-gold"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Dein Spitzname in dieser Gruppe"
            />
            <button
              className="rounded-full border border-hm-gold px-5 py-3 text-sm font-bold text-hm-ink disabled:opacity-40"
              type="button"
              disabled={busy}
              onClick={() => void run({ action: "setNickname", nickname: nickname || null }, "Spitzname gespeichert.")}
            >
              Spitzname
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-hm-gold px-4 py-2 text-sm font-bold text-hm-ink"
              type="button"
              disabled={busy}
              onClick={() => void run({ action: "mute", muted: !meta.isMuted }, meta.isMuted ? "Benachrichtigungen aktiv." : "Gruppe stummgeschaltet.")}
            >
              {meta.isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {meta.isMuted ? "Stummschaltung aus" : "Stummschalten"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-hm-gold/50 px-4 py-2 text-sm font-bold text-hm-inkSoft"
              type="button"
              disabled={busy}
              onClick={() => void startCall("audio")}
            >
              <Mic className="h-4 w-4" />
              Audio
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-hm-gold/50 px-4 py-2 text-sm font-bold text-hm-inkSoft"
              type="button"
              disabled={busy}
              onClick={() => void startCall("video")}
            >
              <Video className="h-4 w-4" />
              Video
            </button>
            <button
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#9C4A3C]/40 px-4 py-2 text-sm font-bold text-[#9C4A3C]"
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Gruppe wirklich verlassen?")) void run({ action: "leave" }, "Du hast die Gruppe verlassen.");
              }}
            >
              <PhoneOff className="h-4 w-4" />
              Chat verlassen
            </button>
          </div>

          {isAdmin ? (
            <div className="rounded-3xl border border-hm-borderSoft bg-hm-porcelain p-4">
              <p className="text-sm font-bold text-hm-ink">Personen hinzufuegen</p>
              <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
              <input
                className="mt-3 w-full rounded-2xl border border-hm-border bg-hm-ivory px-4 py-3 text-sm outline-none focus:border-hm-gold"
                value={query}
                onChange={(event) => void searchPeople(event.target.value)}
                placeholder="Nach Benutzername suchen"
              />
              <div className="mt-2 max-h-36 overflow-auto">
                {people.map((person) => (
                  <button
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left hover:bg-hm-champagne"
                    key={person.id}
                    type="button"
                    onClick={() => {
                      if (!selected.some((item) => item.id === person.id)) setSelected((current) => [...current, person]);
                      setQuery("");
                      setPeople([]);
                    }}
                  >
                    <span>
                      <span className="block text-sm font-bold text-hm-ink">{person.name}</span>
                      <span className="text-xs text-hm-inkSoft">@{person.username}</span>
                    </span>
                    <Plus className="h-4 w-4 text-hm-goldDeep" />
                  </button>
                ))}
              </div>
              <button
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-hm-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
                type="button"
                disabled={selected.length === 0 || busy}
                onClick={() => void run({ action: "addMembers", userIds: selected.map((person) => person.id) }, "Mitglieder hinzugefuegt.")}
              >
                <UserPlus className="h-4 w-4" />
                Hinzufuegen
              </button>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-bold text-hm-ink">Mitglieder</p>
            {meta.members.map((member) => (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-hm-borderSoft bg-hm-porcelain p-3" key={member.id}>
                <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-hm-champagne text-sm font-bold text-hm-ink">
                  {member.avatarUrl ? <img alt={member.name} className="h-full w-full object-cover" src={member.avatarUrl} /> : member.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-hm-ink">{member.name}{member.mine ? " (du)" : ""}</span>
                  <span className="text-xs text-hm-inkSoft">@{member.username}</span>
                </span>
                {member.role === "admin" ? <span className="inline-flex items-center gap-1 rounded-full bg-hm-champagne px-3 py-1 text-xs font-bold text-hm-goldDeep"><Shield className="h-3 w-3" /> Admin</span> : null}
                {isAdmin && !member.mine ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full border border-hm-gold px-3 py-1 text-xs font-bold text-hm-ink"
                      type="button"
                      disabled={busy}
                      onClick={() => void run({ action: member.role === "admin" ? "demote" : "promote", userId: member.id }, "Rolle aktualisiert.")}
                    >
                      {member.role === "admin" ? "Admin entfernen" : "Zum Admin"}
                    </button>
                    <button
                      className="rounded-full border border-[#9C4A3C]/40 px-3 py-1 text-xs font-bold text-[#9C4A3C]"
                      type="button"
                      disabled={busy}
                      onClick={() => void run({ action: "removeMember", userId: member.id }, "Mitglied entfernt.")}
                    >
                      <UserMinus className="inline h-3 w-3" /> Entfernen
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {status ? <p className="rounded-2xl bg-hm-champagne px-4 py-3 text-sm font-semibold text-hm-ink">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
