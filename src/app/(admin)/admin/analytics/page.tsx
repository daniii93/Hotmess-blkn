import { AnalyticsDashboards } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";
import { getAdminLiveSnapshot } from "@/features/admin/live-service";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const snapshot = await getAdminLiveSnapshot();

  return (
    <>
      <PageShell pageKey="adminAnalytics" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <AnalyticsDashboards items={snapshot.analytics} />
      </section>
    </>
  );
}
