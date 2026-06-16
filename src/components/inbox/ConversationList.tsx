import Link from "next/link";
import type { InboxConversation } from "@/features/inbox/live-service";
import { ConversationRow } from "./ConversationRow";

export function ConversationList({ conversations, requestCount }: { conversations: InboxConversation[]; requestCount: number }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-hm-ink">Nachrichten</h2>
        <Link className="text-sm font-semibold text-hm-goldDeep" href="/chat/requests">
          Anfragen{requestCount > 0 ? ` (${requestCount})` : ""}
        </Link>
      </div>
      {conversations.length === 0 ? (
        <div className="rounded-3xl border border-hm-gold/20 bg-hm-porcelain p-8 text-center shadow-sm">
          <p className="hm-display text-2xl text-hm-ink">Noch keine Nachrichten</p>
          <p className="mt-2 text-sm text-hm-inkSoft">Starte einen Chat mit Freunden oder Event-Kontakten.</p>
          <Link className="mt-5 inline-flex rounded-full bg-hm-ink px-5 py-3 text-sm font-bold text-white" href="/chat/new">
            Neue Nachricht
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <ConversationRow conversation={conversation} key={conversation.id} />
          ))}
        </div>
      )}
    </section>
  );
}
