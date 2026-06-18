import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LocalServiceProviderForm } from "@/components/local-services/LocalServicesForms";
import { getAllowedLocalServiceCategories, getLocalServiceCategories, getLocalServiceMe } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceCompanyActivatePage() {
  const [me, categories] = await Promise.all([getLocalServiceMe(), getLocalServiceCategories()]);

  if (!me) return <Gate title="Bitte einloggen" text="Du brauchst ein Konto, um Anbieter zu werden." href="/login?returnTo=/local-services/company/activate" label="Einloggen" />;
  if (!me.verified) return <Gate title="Verifizierung erforderlich" text="Anbieter werden erst nach Identitaetspruefung freigeschaltet." href="/verify" label="Jetzt verifizieren" />;
  if (!me.businessProfile) return <Gate title="Business-Profil fehlt" text="Lege zuerst dein HotMess Business-Profil an. Danach kannst du lokale Dienstleistungen beantragen." href="/business/profile" label="Business-Profil anlegen" />;
  if (me.businessProfile.verificationStatus !== "verified") {
    return <Gate title="Unternehmen in Pruefung" text="Dein Business-Profil muss zuerst verifiziert werden. Bis dahin bleibt dein Anbieterprofil unsichtbar." href="/business/profile" label="Business-Status ansehen" />;
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zu Dienstleistungen
      </Link>
      {me.providerProfile ? (
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <p className="hm-label">Status</p>
          <h1 className="hm-display mt-2 text-4xl text-hm-ink">Anbieterprofil {me.providerProfile.verificationStatus}</h1>
          <p className="mt-3 text-sm text-hm-inkSoft">
            {me.providerProfile.verificationStatus === "verified"
              ? "Du bist freigeschaltet und kannst im Dashboard Leads bearbeiten."
              : "Deine Angaben sind gespeichert. Admin-Freigabe ist noch offen."}
          </p>
          <Link href="/local-services/company/dashboard" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Zum Anbieter-Dashboard</Link>
        </section>
      ) : null}
      <LocalServiceProviderForm categories={categories} allowedCategoryIds={getAllowedLocalServiceCategories(categories, me.businessProfile).map((category) => category.id)} />
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
