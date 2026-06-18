import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OfferAcceptButton } from "@/components/local-services/LocalServicesForms";
import { formatLocalServiceMoney, getLocalServiceProject, getProjectOffers } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceProjectOffersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, offers] = await Promise.all([getLocalServiceProject(id), getProjectOffers(id)]);

  if (!project) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
          <h1 className="hm-display text-4xl text-hm-ink">Auftrag nicht gefunden</h1>
          <Link href="/local-services" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Zurueck</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zu Dienstleistungen
      </Link>
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label">Kundenauftrag</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">{project.title}</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">{project.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Info label="Kategorie" value={project.category?.name ?? "Offen"} />
          <Info label="Budget" value={formatLocalServiceMoney(project.budgetCents)} />
          <Info label="Ort" value={project.city ?? "Offen"} />
          <Info label="Status" value={project.status} />
        </div>
      </section>

      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="hm-label">Angebote</p>
            <h2 className="hm-display mt-2 text-3xl text-hm-ink">Vergleichen und beauftragen</h2>
          </div>
          <Link href="/chat" className="rounded-pill border border-hm-gold/30 px-4 py-2 text-xs font-bold text-hm-ink">Chat</Link>
        </div>
        <div className="mt-5 grid gap-4">
          {offers.length ? offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border border-hm-border bg-hm-ivory p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-hm-ink">{offer.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{offer.description}</p>
                </div>
                <span className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-bold text-white">{formatLocalServiceMoney(offer.totalPriceCents)}</span>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-hm-inkSoft sm:grid-cols-4">
                <span>Arbeit {formatLocalServiceMoney(offer.laborCostCents)}</span>
                <span>Material {formatLocalServiceMoney(offer.materialCostCents)}</span>
                <span>Start {offer.startDate ?? "offen"}</span>
                <span>Status {offer.status}</span>
              </div>
              {offer.status === "sent" ? <div className="mt-4"><OfferAcceptButton offer={offer} /></div> : null}
            </article>
          )) : (
            <p className="rounded-xl bg-hm-ivory px-4 py-6 text-sm text-hm-inkSoft">Noch keine Angebote. Sobald ein Anbieter deinen Lead kauft und ein Angebot sendet, erscheint es hier.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-hm-ivory px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-hm-inkSoft">{label}</p>
      <p className="mt-1 text-sm font-bold text-hm-ink">{value || "Offen"}</p>
    </div>
  );
}
