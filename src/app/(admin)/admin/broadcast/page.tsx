import { PageShell } from "@/components/shell/page-shell";
import { BroadcastComposer, BroadcastStats, SegmentBuilder } from "@/components/admin/admin-dashboard-sections";

export default function AdminBroadcastPage() {
  return (
    <>
      <PageShell pageKey="adminBroadcast" emptyKey="admin" accent="admin" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <BroadcastComposer />
        <div className="grid gap-5 lg:grid-cols-2">
          <SegmentBuilder />
          <BroadcastStats />
        </div>
      </section>
    </>
  );
}
