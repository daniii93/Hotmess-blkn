import { PageShell } from "@/components/shell/page-shell";
import {
  CancelEventButton,
  GenderBreakdown,
  GuestListExport,
  LiveSalesDashboard,
} from "@/components/admin/event-admin-sections";

export default function AdminEventSalesPage() {
  return (
    <>
      <PageShell pageKey="adminEventSales" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <LiveSalesDashboard />
        <GenderBreakdown />
        <div className="flex flex-wrap gap-3">
          <GuestListExport />
          <CancelEventButton />
        </div>
      </section>
    </>
  );
}
