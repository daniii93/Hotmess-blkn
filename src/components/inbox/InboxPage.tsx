import type { InboxData } from "@/features/inbox/live-service";
import { ConversationList } from "./ConversationList";
import { InboxHeader } from "./InboxHeader";
import { InboxSearch } from "./InboxSearch";
import { InboxRealtimeBridge } from "./InboxRealtimeBridge";
import { NotesRow } from "./NotesRow";

export function InboxPage({ data }: { data: InboxData }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-32 pt-1">
      <InboxRealtimeBridge />
      <InboxHeader viewer={data.viewer} />
      <div className="space-y-5">
        <InboxSearch />
        <NotesRow viewer={data.viewer} notes={data.notes} />
        <ConversationList conversations={data.conversations} requestCount={data.requestCount} />
      </div>
    </main>
  );
}
