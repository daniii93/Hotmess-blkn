"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble, type ChatScreenMessage } from "./MessageBubble";
import { MessageContextMenu, type MessageContextAction } from "./MessageContextMenu";

type ActiveContext = {
  message: ChatScreenMessage;
  x: number;
  y: number;
};

type ChatScreenProps = {
  name: string;
  status: string;
  avatarUrl?: string;
  messages: ChatScreenMessage[];
  onAction?: (message: ChatScreenMessage, action: MessageContextAction) => void;
};

export function ChatScreen({ name, status, avatarUrl, messages, onAction }: ChatScreenProps) {
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const dimmed = activeContext !== null;
  const sortedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!activeContext) return;
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setActiveContext(null);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [activeContext]);

  const openContext = (message: ChatScreenMessage, rect: DOMRect) => {
    const width = Math.min(292, window.innerWidth - 28);
    const x = Math.min(Math.max(14, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 14);
    const preferredY = rect.bottom + 10;
    const y = preferredY + 250 > window.innerHeight ? Math.max(14, rect.top - 250) : preferredY;
    setActiveContext({ message, x, y });
  };

  return (
    <section className="mx-auto flex h-[100dvh] max-w-md flex-col bg-white text-zinc-950">
      <header className="flex min-h-16 items-center gap-3 border-b border-black/10 px-3">
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-zinc-100" type="button" aria-label="Zurück">
          ←
        </button>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">
          {avatarUrl ? <img className="h-full w-full object-cover" src={avatarUrl} alt={name} /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{name}</h1>
          <p className="truncate text-xs text-zinc-500">{status}</p>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full text-violet-600 hover:bg-zinc-100" type="button" aria-label="Telefon">
          ☎
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full text-violet-600 hover:bg-zinc-100" type="button" aria-label="Video">
          ▣
        </button>
      </header>

      <div className={`relative flex-1 overflow-y-auto px-3 py-4 transition ${dimmed ? "blur-[1px]" : ""}`}>
        <div className="grid gap-3">
          {sortedMessages.map((message) => (
            <MessageBubble key={message.id} message={message} onOpenContext={openContext} />
          ))}
        </div>
      </div>

      <form className="flex items-center gap-2 border-t border-black/10 p-3">
        <button className="grid h-10 w-10 place-items-center rounded-full text-violet-600 hover:bg-zinc-100" type="button" aria-label="Kamera">
          ◎
        </button>
        <input className="min-h-10 flex-1 rounded-full bg-zinc-100 px-4 text-sm outline-none focus:ring-2 focus:ring-violet-300" placeholder="Chat schreiben" />
        <button className="grid h-10 w-10 place-items-center rounded-full text-violet-600 hover:bg-zinc-100" type="button" aria-label="Galerie">
          ◱
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-violet-600 text-white" type="submit" aria-label="Senden">
          ↑
        </button>
      </form>

      {activeContext ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[2px]" />
          <div ref={menuRef}>
            <MessageContextMenu
              x={activeContext.x}
              y={activeContext.y}
              pinned={pinned}
              muted={muted}
              onAction={(action) => {
                if (action === "pin") setPinned(true);
                if (action === "unpin") setPinned(false);
                if (action === "mute") setMuted(true);
                if (action === "unmute") setMuted(false);
                onAction?.(activeContext.message, action);
                setActiveContext(null);
              }}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
