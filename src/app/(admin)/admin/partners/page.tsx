import { ClubManager, HotelManager, SponsorManager } from "@/components/admin/admin-dashboard-sections";
import { PageShell } from "@/components/shell/page-shell";

export default function AdminPartnersPage() {
  return (
    <>
      <PageShell pageKey="adminPartners" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <HotelManager />
        <div className="grid gap-5 lg:grid-cols-2">
          <ClubManager />
          <SponsorManager />
        </div>
      </section>
    </>
  );
}
