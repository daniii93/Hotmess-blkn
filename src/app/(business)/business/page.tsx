import { PageShell } from "@/components/shell/page-shell";
import { BusinessGate, EventNetworkingBanner, SuggestionStack } from "@/components/business/business-sections";
import { getBusinessMe, getBusinessSuggestions } from "@/features/business/live-service";

export const dynamic = "force-dynamic";

export default async function BusinessPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const params = await searchParams;
  const eventOnly = params?.filter === "event";
  const [me, suggestions] = await Promise.all([getBusinessMe(), getBusinessSuggestions(eventOnly)]);

  return (
    <>
      <PageShell pageKey="business" accent="business" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.45fr_0.55fr] lg:px-10">
        <BusinessGate me={me} />
        {me?.businessEnabled && me.profile ? (
          <>
            <EventNetworkingBanner suggestions={suggestions} />
            <SuggestionStack suggestions={suggestions} />
          </>
        ) : null}
      </section>
    </>
  );
}
