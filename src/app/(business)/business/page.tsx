import { PageShell } from "@/components/shell/page-shell";
import { EventNetworkingBanner, SuggestionStack } from "@/components/business/business-sections";

export default function BusinessPage() {
  return (
    <>
      <PageShell pageKey="business" accent="business" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.45fr_0.55fr] lg:px-10">
        <EventNetworkingBanner />
        <SuggestionStack />
      </section>
    </>
  );
}
