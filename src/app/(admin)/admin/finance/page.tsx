import { FinanceExport, FinanceOverview, PartnerSettlements, PerEventPnL } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";
import { getAdminLiveSnapshot } from "@/features/admin/live-service";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const snapshot = await getAdminLiveSnapshot();

  return (
    <>
      <PageShell pageKey="adminFinance" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <FinanceOverview finance={snapshot.finance} />
        <div className="grid gap-5 lg:grid-cols-2">
          <PerEventPnL finance={snapshot.finance} />
          <PartnerSettlements />
        </div>
        <FinanceExport />
      </section>
    </>
  );
}
