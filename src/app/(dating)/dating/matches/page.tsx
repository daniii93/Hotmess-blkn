import { PageShell } from "@/components/shell/page-shell";
import { MatchList } from "@/components/dating/dating-sections";

export default function DatingMatchesPage() {
  return (
    <>
      <PageShell pageKey="datingMatches" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <MatchList />
      </section>
    </>
  );
}
