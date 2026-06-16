import { PageShell } from "@/components/shell/page-shell";
import { JobBoard } from "@/components/business/business-sections";
import { getJobListings } from "@/features/business/live-service";

export const dynamic = "force-dynamic";

export default async function BusinessJobsPage() {
  const jobs = await getJobListings();

  return (
    <>
      <PageShell pageKey="businessJobs" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <JobBoard jobs={jobs} />
      </section>
    </>
  );
}
