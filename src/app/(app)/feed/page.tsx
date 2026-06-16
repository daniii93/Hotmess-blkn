import { PageShell } from "@/components/shell/page-shell";
import { FeedFunctionHub } from "@/components/social/FeedFunctionHub";
import { FeedList, StoryBar } from "@/components/social/social-sections";
import { getFeedPosts, getFriendActivity, getStoryBar } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [stories, posts, activities] = await Promise.all([
    getStoryBar(),
    getFeedPosts(),
    getFriendActivity(),
  ]);

  return (
    <>
      <PageShell pageKey="feed" emptyKey="feed" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <FeedFunctionHub />
        <StoryBar stories={stories} />
        <FeedList posts={posts} activities={activities} />
      </section>
    </>
  );
}
