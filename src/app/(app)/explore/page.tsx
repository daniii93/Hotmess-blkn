import { PageShell } from "@/components/shell/page-shell";
import { DiscoverGrid, SearchBar } from "@/components/social/social-sections";
import { getExploreData } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const { people, hashtags } = await getExploreData();

  return (
    <>
      <PageShell pageKey="explore" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <SearchBar />
        <DiscoverGrid people={people} hashtags={hashtags} />
      </section>
    </>
  );
}
