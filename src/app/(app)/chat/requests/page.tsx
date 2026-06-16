import { redirect } from "next/navigation";
import { RequestsList } from "@/components/inbox/RequestsList";
import { getMessageRequests } from "@/features/inbox/live-service";

export const dynamic = "force-dynamic";

export default async function ChatRequestsPage() {
  const requests = await getMessageRequests();
  if (!requests) redirect("/login?returnTo=/chat/requests");

  return <RequestsList requests={requests} />;
}
