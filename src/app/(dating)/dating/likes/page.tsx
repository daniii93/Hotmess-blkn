import { PageShell } from "@/components/shell/page-shell";
import { WhoLikesYou } from "@/components/dating/dating-sections";
import { getDatingLikes, getDatingMe } from "@/features/dating/live-service";

export const dynamic = "force-dynamic";

export default async function DatingLikesPage() {
  const [me, likes] = await Promise.all([getDatingMe(), getDatingLikes()]);

  return (
    <>
      <PageShell pageKey="datingLikes" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <WhoLikesYou likes={likes} tier={me?.datingProfile?.tier ?? "free"} />
      </section>
    </>
  );
}
