import { PageShell } from "@/components/shell/page-shell";
import { EventFilter, EventGrid } from "@/components/events/event-sections";
import { getPublishedEvents } from "@/features/events/live-service";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <>
      <PageShell pageKey="events" emptyKey="events" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <EventFilter />
        <EventGrid events={events} />
      </section>
    </>
  );
}
