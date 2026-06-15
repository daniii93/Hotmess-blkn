import { PageShell } from "@/components/shell/page-shell";
import { EventFilterBanner, SwipeStack } from "@/components/dating/dating-sections";

export default function DatingPage() {
  return (
    <>
      <PageShell pageKey="dating" accent="dating" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.45fr_0.55fr] lg:px-10">
        <EventFilterBanner />
        <SwipeStack />
      </section>
    </>
  );
}
