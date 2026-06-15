import { PageShell } from "@/components/shell/page-shell";
import { ConversationList, RequestsFolder } from "@/components/social/social-sections";
import { getConversations } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const conversations = await getConversations();

  return (
    <>
      <PageShell pageKey="chat" emptyKey="chat" />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-[0.62fr_0.38fr] lg:px-10">
        <ConversationList conversations={conversations} />
        <RequestsFolder />
      </section>
    </>
  );
}
