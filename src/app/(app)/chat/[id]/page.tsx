import { ChatThread } from "@/components/social/social-sections";
import { getChatMessages } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await getChatMessages(id);

  return <ChatThread conversationId={id} messages={messages} />;
}
