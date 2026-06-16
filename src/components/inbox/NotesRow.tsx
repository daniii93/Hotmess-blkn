"use client";

import { useState } from "react";
import type { InboxAuthor, InboxNote } from "@/features/inbox/live-service";

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

function Avatar({ user }: { user: InboxAuthor }) {
  return (
    <span className="grid size-16 place-items-center overflow-hidden rounded-full border border-hm-gold bg-hm-champagne text-base font-bold text-hm-ink">
      {user.avatarUrl ? <img alt={user.name} className="h-full w-full object-cover" src={user.avatarUrl} /> : initials(user.name)}
    </span>
  );
}

export function NotesRow({ viewer, notes }: { viewer: InboxAuthor; notes: InboxNote[] }) {
  const ownNote = notes.find((note) => note.mine);
  const friendNotes = notes.filter((note) => !note.mine);
  const [noteText, setNoteText] = useState(ownNote?.text ?? "");
  const [saving, setSaving] = useState(false);

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    await fetch("/api/chat/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: noteText.trim(), audience: "friends" }),
    });
    setSaving(false);
  };

  const likeNote = async (noteUserId: string) => {
    await fetch("/api/chat/notes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "like", noteUserId }),
    });
  };

  const replyNote = async (noteUserId: string) => {
    const text = window.prompt("Auf Notiz antworten");
    if (!text?.trim()) return;
    const response = await fetch("/api/chat/notes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reply", noteUserId, text: text.trim() }),
    });
    const payload = await response.json().catch(() => null) as { conversationId?: string } | null;
    if (payload?.conversationId) window.location.href = `/chat/${payload.conversationId}`;
  };

  return (
    <section className="overflow-x-auto py-2">
      <div className="flex gap-4">
        <div className="w-24 shrink-0 text-center">
          <button className="relative mx-auto block" type="button" onClick={saveNote} disabled={saving}>
            <span className="absolute -top-3 left-1/2 max-w-24 -translate-x-1/2 truncate rounded-full bg-hm-porcelain px-3 py-1 text-[11px] font-semibold text-hm-ink shadow-sm">
              {ownNote?.text || "Deine Notiz"}
            </span>
            <Avatar user={viewer} />
          </button>
          <input
            aria-label="Deine Notiz"
            className="mt-2 w-full rounded-full border border-hm-border bg-hm-porcelain px-2 py-1 text-center text-[11px] outline-none focus:border-hm-gold"
            maxLength={60}
            placeholder="Notiz"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveNote();
            }}
          />
        </div>
        {friendNotes.map((note) => (
          <div className="relative w-24 shrink-0 text-center" key={note.user.id}>
            <span className="absolute -top-3 left-1/2 max-w-24 -translate-x-1/2 truncate rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-semibold text-hm-ink shadow-sm">
              {note.text}
            </span>
            <button type="button" onClick={() => void replyNote(note.user.id)}>
              <Avatar user={note.user} />
            </button>
            <span className="mt-2 block truncate text-xs text-hm-inkSoft">{note.user.name.split(" ")[0]}</span>
            <button className="mt-1 rounded-pill bg-hm-porcelain px-2 py-0.5 text-[10px] font-bold text-hm-goldDeep" type="button" onClick={() => void likeNote(note.user.id)}>Like</button>
          </div>
        ))}
      </div>
    </section>
  );
}
