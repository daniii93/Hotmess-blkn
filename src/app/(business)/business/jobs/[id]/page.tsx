import { PageShell } from "@/components/shell/page-shell";
import { JobDetail } from "@/components/business/business-sections";
import { getJobListing } from "@/features/business/live-service";

export const dynamic = "force-dynamic";

export default async function BusinessJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobListing(id);

  return (
    <>
      <PageShell pageKey="businessJobDetail" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <JobDetail job={job} />
      </section>
    </>
  );
}
