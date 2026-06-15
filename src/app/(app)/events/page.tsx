import { PageShell } from "@/components/shell/page-shell";
import { EventFilter, EventGrid } from "@/components/events/event-sections";

export default function EventsPage() {
  return (
    <>
      <PageShell pageKey="events" emptyKey="events" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <EventFilter />
        <EventGrid />
      </section>
    </>
  );
}
