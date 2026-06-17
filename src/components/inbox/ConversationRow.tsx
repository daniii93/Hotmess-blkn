"use client";

import Link from "next/link";
import { type MouseEvent, type PointerEvent, useRef, useState } from "react";
import { Archive, Ban, Bell, BellOff, CheckCheck, Flag, MoreHorizontal, Ticket, Trash2 } from "lucide-react";
import type { InboxConversation } from "@/features/inbox/live-service";

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

type InboxAction = "mute" | "unmute" | "read" | "unread" | "archive" | "delete" | "block" | "report";

export function ConversationRow({ conversation, onChanged }: { conversation: InboxConversation; onChanged?: () => void }) {
  const primaryParticipant = conversation.participants[0];
  const avatarUrl = conversation.avatarUrl ?? primaryParticipant?.avatarUrl ?? null;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const movedRef = useRef(false);

  const act = async (action: InboxAction) => {
    const response = await fetch("/api/chat/conversation/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, action }),
    });

    if (!response.ok) return;
    if (action === "archive" || action === "delete" || action === "block") setHidden(true);
    setOpen(false);
    onChanged?.();
  };

  const resetSwipe = () => {
    startXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setIsDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (startXRef.current === null) return;
    const next = Math.max(-124, Math.min(124, event.clientX - startXRef.current));
    if (Math.abs(next) > 8) movedRef.current = true;
    setDragX(next);
  };

  const onPointerUp = () => {
    const finalX = dragX;
    resetSwipe();
    if (finalX > 92) {
      void act(conversation.unreadCount > 0 ? "read" : "unread");
      return;
    }
    if (finalX < -92) {
      void act("archive");
    }
  };

  const blockSwipeClick = (event: MouseEvent) => {
    if (!movedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    movedRef.current = false;
  };

  if (hidden) return null;

  return (
    <article className="relative overflow-hidden rounded-2xl transition hover:bg-hm-champagne/40">
      <div className="absolute inset-y-0 left-0 flex w-32 items-center bg-hm-goldDeep/15 px-4 text-xs font-bold uppercase tracking-[0.14em] text-hm-goldDeep">
        {conversation.unreadCount > 0 ? "Gelesen" : "Ungelesen"}
      </div>
      <div className="absolute inset-y-0 right-0 flex w-32 items-center justify-end bg-[#9C4A3C]/10 px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#9C4A3C]">
        Archiv
      </div>
      <div
        className={`relative z-10 flex touch-pan-y items-center gap-2 bg-hm-ivory px-2 py-3 ${isDragging ? "" : "transition-transform duration-200"}`}
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerCancel={resetSwipe}
        onPointerUp={onPointerUp}
      >
        <Link className="flex min-w-0 flex-1 items-center gap-3" href={`/chat/${conversation.id}`} onClick={blockSwipeClick}>
          <span
            className={`grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-hm-champagne text-base font-bold text-hm-ink ${
              primaryParticipant?.hasStory ? "ring-2 ring-hm-gold ring-offset-2 ring-offset-hm-ivory" : "border border-hm-gold/30"
            }`}
          >
            {avatarUrl ? <img alt={conversation.name} className="h-full w-full object-cover" src={avatarUrl} /> : initials(conversation.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`flex items-center gap-1 truncate text-sm ${conversation.unreadCount > 0 ? "font-extrabold text-hm-ink" : "font-semibold text-hm-ink"}`}>
              {conversation.isEventChat ? <Ticket className="h-3.5 w-3.5 text-hm-goldDeep" /> : null}
              {conversation.name}
              {conversation.isMuted ? <BellOff className="h-3.5 w-3.5 text-hm-inkSoft" /> : null}
            </span>
            <span className={`mt-0.5 block truncate text-sm ${conversation.unreadCount > 0 ? "font-semibold text-hm-ink" : "text-hm-inkSoft"}`}>
              {conversation.preview} - {conversation.timeLabel}
            </span>
            {conversation.seenLabel ? <span className="mt-0.5 block text-xs text-hm-inkSoft">{conversation.seenLabel}</span> : null}
          </span>
        </Link>

        {conversation.unreadCount > 0 ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-hm-goldDeep px-1.5 py-0.5 text-[10px] font-bold text-white">
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </span>
        ) : null}

        <button
          aria-label="Chat-Aktionen"
          className="grid size-9 shrink-0 place-items-center rounded-full text-hm-inkSoft hover:bg-hm-champagne"
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <div className="absolute right-2 top-14 z-20 grid min-w-56 gap-1 rounded-2xl border border-hm-gold/20 bg-hm-porcelain p-2 text-sm shadow-luxury">
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-hm-ink hover:bg-hm-champagne" type="button" onClick={() => void act(conversation.isMuted ? "unmute" : "mute")}>
            {conversation.isMuted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {conversation.isMuted ? "Ton einschalten" : "Stummschalten"}
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-hm-ink hover:bg-hm-champagne" type="button" onClick={() => void act(conversation.unreadCount > 0 ? "read" : "unread")}>
            <CheckCheck className="h-4 w-4" />
            {conversation.unreadCount > 0 ? "Als gelesen markieren" : "Als ungelesen markieren"}
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-hm-ink hover:bg-hm-champagne" type="button" onClick={() => void act("archive")}>
            <Archive className="h-4 w-4" />
            Archivieren
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-hm-ink hover:bg-hm-champagne" type="button" onClick={() => void act("delete")}>
            <Trash2 className="h-4 w-4" />
            Fuer mich loeschen
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[#9C4A3C] hover:bg-[#9C4A3C]/10" type="button" onClick={() => void act("report")}>
            <Flag className="h-4 w-4" />
            Melden
          </button>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[#9C4A3C] hover:bg-[#9C4A3C]/10" type="button" onClick={() => void act("block")}>
            <Ban className="h-4 w-4" />
            Blockieren
          </button>
        </div>
      ) : null}
    </article>
  );
}
