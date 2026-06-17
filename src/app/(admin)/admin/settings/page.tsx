import { AdminTeam, ContentEditor, PlatformToggles } from "@/components/admin/admin-dashboard-sections";
import { LogoutButton } from "@/components/LogoutButton";
import { PageShell } from "@/components/shell/page-shell";

export default function AdminSettingsPage() {
  return (
    <>
      <PageShell pageKey="adminSettings" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <PlatformToggles />
        <div className="grid gap-5 lg:grid-cols-2">
          <ContentEditor />
          <AdminTeam />
        </div>
        <section className="rounded-card border border-red-500/20 bg-hm-porcelain p-5 shadow-soft">
          <p className="hm-label text-red-500">Admin-Sitzung</p>
          <h2 className="hm-display mt-2 text-2xl text-hm-ink">Konto wechseln</h2>
          <p className="mt-2 text-sm text-hm-inkSoft">
            Melde dich hier vollständig ab, um vom Admin-Konto zu einem Kunden-Testkonto oder zurück zu wechseln.
          </p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </section>
      </section>
    </>
  );
}
