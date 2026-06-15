import { PageShell } from "@/components/shell/page-shell";
import { PastEventsTab, TicketCard } from "@/components/tickets/ticket-sections";

export default function TicketsPage() {
  return (
    <>
      <PageShell pageKey="tickets" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <TicketCard />
        <PastEventsTab />
      </section>
    </>
  );
}
