import Link from "next/link";
import { BellOff, Ticket } from "lucide-react";
import type { InboxConversation } from "@/features/inbox/live-service";

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

export function ConversationRow({ conversation }: { conversation: InboxConversation }) {
  const primaryParticipant = conversation.participants[0];
  const avatarUrl = conversation.avatarUrl ?? primaryParticipant?.avatarUrl ?? null;

  return (
    <Link
      className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-hm-champagne/40"
      href={`/chat/${conversation.id}`}
    >
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
          {conversation.preview} · {conversation.timeLabel}
        </span>
        {conversation.seenLabel ? <span className="mt-0.5 block text-xs text-hm-inkSoft">{conversation.seenLabel}</span> : null}
      </span>
      {conversation.unreadCount > 0 ? (
        <span className="grid min-w-5 place-items-center rounded-full bg-hm-goldDeep px-1.5 py-0.5 text-[10px] font-bold text-white">
          {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
