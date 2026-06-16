import { AdminPartnerProgramSections } from "@/components/admin/admin-partner-program-sections";
import { PageShell } from "@/components/shell/page-shell";
import { getAdminPartnerProgramSnapshot } from "@/features/admin/partner-program-service";

export const dynamic = "force-dynamic";

export default async function AdminPartnersProgramPage() {
  const snapshot = await getAdminPartnerProgramSnapshot();
  return (
    <>
      <PageShell pageKey="adminPartnersProgram" emptyKey="admin" accent="admin" />
      <AdminPartnerProgramSections snapshot={snapshot} />
    </>
  );
}
