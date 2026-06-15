import { PageShell } from "@/components/shell/page-shell";
import { DatingGate, EventFilterBanner, SwipeStack } from "@/components/dating/dating-sections";
import { getDatingCandidates, getDatingMe } from "@/features/dating/live-service";

export const dynamic = "force-dynamic";

export default async function DatingPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const params = await searchParams;
  const eventOnly = params?.filter === "event";
  const [me, candidates] = await Promise.all([getDatingMe(), getDatingCandidates(eventOnly)]);

  return (
    <>
      <PageShell pageKey="dating" accent="dating" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.45fr_0.55fr] lg:px-10">
        <DatingGate me={me} />
        {me?.datingEnabled && me.datingProfile ? (
          <>
            <EventFilterBanner candidates={candidates} />
            <SwipeStack candidates={candidates} />
          </>
        ) : null}
      </section>
    </>
  );
}
