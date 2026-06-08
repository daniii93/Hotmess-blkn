import type { PointerEvent } from "react";

export type ChatScreenMessage = {
  id: string;
  senderName: string;
  avatarUrl?: string;
  text: string;
  mine: boolean;
  status?: "Gesendet" | "Zugestellt" | "Gesehen";
  createdAt: string;
};

type MessageBubbleProps = {
  message: ChatScreenMessage;
  onOpenContext: (message: ChatScreenMessage, rect: DOMRect) => void;
};

export function MessageBubble({ message, onOpenContext }: MessageBubbleProps) {
  let longPressTimer: number | undefined;

  const openContext = (target: HTMLElement) => {
    onOpenContext(message, target.getBoundingClientRect());
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    longPressTimer = window.setTimeout(() => openContext(target), 520);
  };

  const clearLongPress = () => {
    if (longPressTimer) window.clearTimeout(longPressTimer);
  };

  return (
    <div className={`flex w-full items-end gap-2 ${message.mine ? "justify-end" : "justify-start"}`}>
      {!message.mine ? (
        <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
          {message.avatarUrl ? <img className="h-full w-full object-cover" src={message.avatarUrl} alt={message.senderName} /> : null}
        </div>
      ) : null}
      <div
        className={`max-w-[78%] cursor-pointer rounded-[20px] px-4 py-2 text-sm shadow-sm ${
          message.mine ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md bg-zinc-100 text-zinc-950"
        }`}
        onClick={(event) => openContext(event.currentTarget)}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
      >
        <p>{message.text}</p>
        <span className={`mt-1 block text-[11px] ${message.mine ? "text-white/75" : "text-zinc-500"}`}>
          {message.createdAt}
          {message.mine && message.status ? ` · ${message.status}` : ""}
        </span>
      </div>
    </div>
  );
}
