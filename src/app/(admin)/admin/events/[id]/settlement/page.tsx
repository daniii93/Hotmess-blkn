import { EventSettlement, FinanceExport } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";

export default function AdminEventSettlementPage() {
  return (
    <>
      <PageShell pageKey="adminEventSettlement" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <EventSettlement />
        <FinanceExport />
      </section>
    </>
  );
}
