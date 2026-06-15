import { PageShell } from "@/components/shell/page-shell";
import { PastEventsTab, TicketList } from "@/components/tickets/ticket-sections";
import { getCurrentUserTickets } from "@/features/events/live-service";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const tickets = await getCurrentUserTickets();

  return (
    <>
      <PageShell pageKey="tickets" />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 lg:px-10">
        <TicketList tickets={tickets} />
        <PastEventsTab tickets={tickets} />
      </section>
    </>
  );
}
