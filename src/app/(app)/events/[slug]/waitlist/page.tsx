import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/page-shell";
import { getCurrentUserWaitlistEntry, getEventBySlug } from "@/features/events/live-service";

export const dynamic = "force-dynamic";

type EventWaitlistPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventWaitlistPage({ params }: EventWaitlistPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const entry = await getCurrentUserWaitlistEntry(event.id);
  const promoted = entry?.status === "promoted" && entry.promotedUntil;

  return (
    <>
      <PageShell pageKey="waitlist" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Warteliste</p>
          <h2 className="hm-display mt-3 text-3xl text-hm-ink">{event.title}</h2>
          <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
            {entry
              ? `Status: ${entry.status} · Position: ${entry.position} · Kontingent: ${entry.gender}`
              : "Du bist aktuell nicht auf der Warteliste fuer dieses Event."}
          </p>
          {promoted ? (
            <a className="mt-6 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" href={`/events/${event.slug}/checkout`}>
              Jetzt kaufen · Fenster bis {new Date(entry.promotedUntil as string).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}
            </a>
          ) : (
            <p className="mt-6 rounded-card border border-hm-borderSoft bg-hm-ivory px-4 py-3 text-sm text-hm-inkSoft">
              Sobald ein Platz frei wird, bekommst du 20 Minuten Zeit zum Kauf. Danach rueckt die naechste Person nach.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
