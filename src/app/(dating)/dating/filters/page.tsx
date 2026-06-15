import { PageShell } from "@/components/shell/page-shell";
import { DatingFilters } from "@/components/dating/dating-sections";
import { getDatingMe } from "@/features/dating/live-service";

export const dynamic = "force-dynamic";

export default async function DatingFiltersPage() {
  const me = await getDatingMe();

  return (
    <>
      <PageShell pageKey="datingFilters" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <DatingFilters me={me} />
      </section>
    </>
  );
}
