import { PageShell } from "@/components/shell/page-shell";
import {
  DrinkPackageEditor,
  EventCRUD,
  GenderConfigForm,
  TableEditor,
  TicketTypeEditor,
} from "@/components/admin/event-admin-sections";

export default function AdminEventsPage() {
  return (
    <>
      <PageShell pageKey="adminEvents" emptyKey="admin" accent="admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div className="lg:col-span-2">
          <EventCRUD />
        </div>
        <GenderConfigForm />
        <TicketTypeEditor />
        <TableEditor />
        <DrinkPackageEditor />
      </section>
    </>
  );
}
