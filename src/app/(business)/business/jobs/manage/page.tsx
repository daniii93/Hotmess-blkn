import { PageShell } from "@/components/shell/page-shell";
import { ApplicationManager, JobEditor } from "@/components/business/business-sections";

export default function BusinessJobsManagePage() {
  return (
    <>
      <PageShell pageKey="businessJobsManage" accent="business" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <JobEditor />
        <ApplicationManager />
      </section>
    </>
  );
}
