import { FinanceExport } from "@/components/admin/admin-dashboard-sections";
import { EventSettlementLive } from "@/components/admin/event-operations-live";
import { PageShell } from "@/components/shell/page-shell";
import { getEventOperationsSnapshot } from "@/features/admin/event-operations-service";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEventSettlementPage({ params }: Props) {
  const { id } = await params;
  const snapshot = await getEventOperationsSnapshot(id);
  return (
    <>
      <PageShell pageKey="adminEventSettlement" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <EventSettlementLive snapshot={snapshot} />
        <FinanceExport />
      </section>
    </>
  );
}
