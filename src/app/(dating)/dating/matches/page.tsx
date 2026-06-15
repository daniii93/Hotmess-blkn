import { PageShell } from "@/components/shell/page-shell";
import { MatchList } from "@/components/dating/dating-sections";
import { getDatingMatches } from "@/features/dating/live-service";

export const dynamic = "force-dynamic";

export default async function DatingMatchesPage() {
  const matches = await getDatingMatches();

  return (
    <>
      <PageShell pageKey="datingMatches" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <MatchList matches={matches} />
      </section>
    </>
  );
}
