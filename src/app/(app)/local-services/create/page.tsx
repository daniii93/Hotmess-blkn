import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LocalServiceProjectWizard } from "@/components/local-services/LocalServicesForms";
import { getLocalServiceCategories, getLocalServiceMe } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceCreatePage() {
  const [me, categories] = await Promise.all([getLocalServiceMe(), getLocalServiceCategories()]);

  if (!me) return <Gate title="Bitte einloggen" text="Du brauchst ein Konto, um einen Auftrag einzustellen." href="/login?returnTo=/local-services/create" label="Einloggen" />;
  if (!me.verified) return <Gate title="Verifizierung erforderlich" text="Auftraege sind erst nach Identitaetspruefung moeglich." href="/verify" label="Jetzt verifizieren" />;

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zu Dienstleistungen
      </Link>
      <LocalServiceProjectWizard categories={categories} me={me} />
    </main>
  );
}

function Gate({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
        <h1 className="hm-display text-4xl text-hm-ink">{title}</h1>
        <p className="mt-3 text-sm text-hm-inkSoft">{text}</p>
        <Link href={href} className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">{label}</Link>
      </section>
    </main>
  );
}
