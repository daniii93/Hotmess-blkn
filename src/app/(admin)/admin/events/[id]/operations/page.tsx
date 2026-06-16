import { EventOperationsLive } from "@/components/admin/event-operations-live";
import { PageShell } from "@/components/shell/page-shell";
import { getEventOperationsSnapshot } from "@/features/admin/event-operations-service";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEventOperationsPage({ params }: Props) {
  const { id } = await params;
  const snapshot = await getEventOperationsSnapshot(id);
  return (
    <>
      <PageShell pageKey="adminEventOperations" emptyKey="admin" accent="admin" />
      <EventOperationsLive snapshot={snapshot} />
    </>
  );
}
