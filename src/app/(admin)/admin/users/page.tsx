import { PageShell } from "@/components/shell/page-shell";
import { SanctionPanel, UserDetail, UserTable } from "@/components/admin/admin-dashboard-sections";

export default function AdminUsersPage() {
  return (
    <>
      <PageShell pageKey="adminUsers" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <UserTable />
        <div className="grid gap-5 lg:grid-cols-2">
          <UserDetail />
          <SanctionPanel />
        </div>
      </section>
    </>
  );
}
