import Link from "next/link";
import { ChevronLeft, LockKeyhole } from "lucide-react";
import { LeadPurchaseButton } from "@/components/local-services/LocalServicesForms";
import { formatLocalServiceMoney, getProviderLead } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getProviderLead(id);
  const project = lead?.project;

  if (!lead || !project) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
          <h1 className="hm-display text-4xl text-hm-ink">Lead nicht gefunden</h1>
          <Link href="/local-services/company/dashboard" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Zum Dashboard</Link>
        </section>
      </main>
    );
  }

  const purchased = lead.status === "purchased";

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services/company/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zum Dashboard
      </Link>
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label">Lead</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">{project.title}</h1>
        <p className="mt-4 text-sm leading-6 text-hm-inkSoft">{project.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Info label="Kategorie" value={project.category?.name ?? "Offen"} />
          <Info label="Budget" value={formatLocalServiceMoney(project.budgetCents)} />
          <Info label="Leadpreis" value={formatLocalServiceMoney(lead.priceCents)} />
          <Info label="Ort" value={purchased ? `${project.address ?? ""} ${project.zip ?? ""} ${project.city ?? ""}` : `${project.city ?? "Ort"}, Umkreis ${project.radiusKm ?? 10} km`} />
          <Info label="Dringlichkeit" value={project.urgency ?? "flexibel"} />
          <Info label="Status" value={lead.status} />
        </div>
        {!purchased ? (
          <div className="mt-6 rounded-xl bg-hm-ivory p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-hm-ink"><LockKeyhole className="h-4 w-4" /> Kontaktdaten geschuetzt</div>
            <p className="mt-2 text-sm text-hm-inkSoft">Adresse und Chat werden erst nach Leadkauf freigeschaltet.</p>
            <div className="mt-4"><LeadPurchaseButton lead={lead} /></div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/local-services/company/offers/create/${project.id}`} className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Angebot erstellen</Link>
          </div>
        )}
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
