import { PageShell } from "@/components/shell/page-shell";
import { ScannerAccessManager } from "@/components/admin/event-admin-sections";

export default function AdminScannersPage() {
  return (
    <>
      <PageShell pageKey="adminScanners" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <ScannerAccessManager />
      </section>
    </>
  );
}
