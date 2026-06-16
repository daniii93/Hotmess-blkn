import { PageShell } from "@/components/shell/page-shell";
import { SanctionPanel, UserDetail, UserTable } from "@/components/admin/admin-dashboard-sections";
import { getAdminLiveSnapshot } from "@/features/admin/live-service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const snapshot = await getAdminLiveSnapshot();
  const selected = snapshot.users[0];

  return (
    <>
      <PageShell pageKey="adminUsers" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <UserTable users={snapshot.users} />
        <div className="grid gap-5 lg:grid-cols-2">
          <UserDetail user={selected} />
          <SanctionPanel user={selected} />
        </div>
      </section>
    </>
  );
}
