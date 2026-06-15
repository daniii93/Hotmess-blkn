import { PageShell } from "@/components/shell/page-shell";
import { JobDetail } from "@/components/business/business-sections";

export default function BusinessJobDetailPage() {
  return (
    <>
      <PageShell pageKey="businessJobDetail" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <JobDetail />
      </section>
    </>
  );
}
