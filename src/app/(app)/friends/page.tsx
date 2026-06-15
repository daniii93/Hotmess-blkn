import { PageShell } from "@/components/shell/page-shell";
import { FriendActivityFeed } from "@/components/social/social-sections";
import { getFriendActivity } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const activities = await getFriendActivity();

  return (
    <>
      <PageShell pageKey="friends" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <FriendActivityFeed activities={activities} />
      </section>
    </>
  );
}
