import { PageShell } from "@/components/shell/page-shell";
import { AdminLiveSales } from "@/components/admin/admin-live-sales";
import { AdminCancelEventButton } from "@/components/admin/admin-cancel-event-button";
import { getEventBySlug } from "@/features/events/live-service";
import { notFound } from "next/navigation";
import {
  GenderBreakdown,
  GuestListExport,
  LiveSalesDashboard,
} from "@/components/admin/event-admin-sections";

export const dynamic = "force-dynamic";

type AdminEventSalesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventSalesPage({ params }: AdminEventSalesPageProps) {
  const { id } = await params;
  const event = await getEventBySlug(id);

  if (!event) notFound();

  return (
    <>
      <PageShell pageKey="adminEventSales" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <AdminLiveSales event={event} />
        <LiveSalesDashboard />
        <GenderBreakdown />
        <div className="flex flex-wrap gap-3">
          <GuestListExport />
          <AdminCancelEventButton eventId={event.id} />
        </div>
      </section>
    </>
  );
}
