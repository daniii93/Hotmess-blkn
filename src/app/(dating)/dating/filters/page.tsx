import { PageShell } from "@/components/shell/page-shell";
import { DatingFilters } from "@/components/dating/dating-sections";

export default function DatingFiltersPage() {
  return (
    <>
      <PageShell pageKey="datingFilters" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <DatingFilters />
      </section>
    </>
  );
}
