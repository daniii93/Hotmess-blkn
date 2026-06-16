import { PageShell } from "@/components/shell/page-shell";
import { ActivityFeed, AdminDemoIndex, KpiGrid, NextEventCard, QuickActions, RevenueChart, SalesFunnel } from "@/components/admin/admin-dashboard-sections";
import { getAdminLiveSnapshot } from "@/features/admin/live-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const snapshot = await getAdminLiveSnapshot();

  return (
    <>
      <PageShell pageKey="admin" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <AdminDemoIndex />
        <KpiGrid items={snapshot.kpis} />
        <div className="grid gap-5 lg:grid-cols-[0.65fr_0.35fr]">
          <RevenueChart bars={snapshot.revenueBars} />
          <SalesFunnel steps={snapshot.funnel} />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2"><NextEventCard event={snapshot.nextEvent} /></div>
          <QuickActions />
        </div>
        <ActivityFeed items={snapshot.activity} />
      </section>
    </>
  );
}
