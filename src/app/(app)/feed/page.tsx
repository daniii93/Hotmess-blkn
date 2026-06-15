import { PageShell } from "@/components/shell/page-shell";
import { FeedList, StoryBar } from "@/components/social/social-sections";

export default function FeedPage() {
  return (
    <>
      <PageShell pageKey="feed" emptyKey="feed" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <StoryBar />
        <FeedList />
      </section>
    </>
  );
}
