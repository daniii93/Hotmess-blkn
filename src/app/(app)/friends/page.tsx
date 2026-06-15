import { PageShell } from "@/components/shell/page-shell";
import { FriendActivityFeed } from "@/components/social/social-sections";

export default function FriendsPage() {
  return (
    <>
      <PageShell pageKey="friends" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <FriendActivityFeed />
      </section>
    </>
  );
}
