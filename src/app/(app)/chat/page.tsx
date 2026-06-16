import { redirect } from "next/navigation";
import { InboxPage } from "@/components/inbox/InboxPage";
import { getInboxData } from "@/features/inbox/live-service";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const data = await getInboxData();
  if (!data) redirect("/login?returnTo=/chat");

  return <InboxPage data={data} />;
}
