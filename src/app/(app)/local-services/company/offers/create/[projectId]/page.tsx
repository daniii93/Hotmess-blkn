import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OfferCreateForm } from "@/components/local-services/LocalServicesForms";
import { getLocalServiceProject } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceOfferCreatePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getLocalServiceProject(projectId);

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services/company/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zum Dashboard
      </Link>
      {project ? (
        <section className="rounded-xl bg-hm-champagne/60 px-4 py-3 text-sm text-hm-inkSoft">
          Angebot fuer <strong className="text-hm-ink">{project.title}</strong>. Externe Kontaktdaten werden blockiert.
        </section>
      ) : null}
      <OfferCreateForm projectId={projectId} />
    </main>
  );
}
