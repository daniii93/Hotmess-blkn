import { AnalyticsDashboards } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageShell pageKey="adminAnalytics" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <AnalyticsDashboards />
      </section>
    </>
  );
}
