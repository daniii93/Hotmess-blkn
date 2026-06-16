import { ChatThread } from "@/components/social/social-sections";
import { getChatMessages, getChatThreadMeta } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [messages, meta] = await Promise.all([getChatMessages(id), getChatThreadMeta(id)]);

  return <ChatThread conversationId={id} messages={messages} meta={meta} />;
}
