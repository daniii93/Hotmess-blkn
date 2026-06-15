import { PageShell } from "@/components/shell/page-shell";
import { ConnectionList } from "@/components/business/business-sections";

export default function BusinessMatchesPage() {
  return (
    <>
      <PageShell pageKey="businessMatches" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <ConnectionList />
      </section>
    </>
  );
}
