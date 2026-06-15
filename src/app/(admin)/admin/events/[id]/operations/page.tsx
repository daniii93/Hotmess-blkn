import { BirthdayList, BottleServicePlan, CheckinLive, HotMessTimeTracker, TableAssignment } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";

export default function AdminEventOperationsPage() {
  return (
    <>
      <PageShell pageKey="adminEventOperations" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <CheckinLive />
        <div className="grid gap-5 lg:grid-cols-2">
          <BottleServicePlan />
          <BirthdayList />
          <TableAssignment />
          <HotMessTimeTracker />
        </div>
      </section>
    </>
  );
}
