"use client";

import { useCallback, useState } from "react";
import type { InboxData } from "@/features/inbox/live-service";
import { ConversationList } from "./ConversationList";
import { InboxHeader } from "./InboxHeader";
import { InboxSearch } from "./InboxSearch";
import { InboxRealtimeBridge } from "./InboxRealtimeBridge";
import { NotesRow } from "./NotesRow";

export function InboxPage({ data }: { data: InboxData }) {
  const [inboxData, setInboxData] = useState(data);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/chat/inbox", { cache: "no-store" });
    if (response.ok) setInboxData(await response.json());
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-32 pt-1">
      <InboxRealtimeBridge onRefresh={refresh} />
      <InboxHeader viewer={inboxData.viewer} />
      <div className="space-y-5">
        <InboxSearch />
        <NotesRow viewer={inboxData.viewer} notes={inboxData.notes} />
        <ConversationList conversations={inboxData.conversations} requestCount={inboxData.requestCount} onChanged={refresh} />
      </div>
    </main>
  );
}
