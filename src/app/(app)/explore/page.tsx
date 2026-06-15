import { PageShell } from "@/components/shell/page-shell";
import { DiscoverGrid, SearchBar } from "@/components/social/social-sections";

export default function ExplorePage() {
  return (
    <>
      <PageShell pageKey="explore" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <SearchBar />
        <DiscoverGrid />
      </section>
    </>
  );
}
