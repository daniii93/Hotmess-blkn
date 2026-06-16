import { PageShell } from "@/components/shell/page-shell";
import { ConnectionList } from "@/components/business/business-sections";
import { getBusinessMatches } from "@/features/business/live-service";

export const dynamic = "force-dynamic";

export default async function BusinessMatchesPage() {
  const matches = await getBusinessMatches();

  return (
    <>
      <PageShell pageKey="businessMatches" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <ConnectionList matches={matches} />
      </section>
    </>
  );
}
