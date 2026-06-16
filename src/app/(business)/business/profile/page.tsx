import { PageShell } from "@/components/shell/page-shell";
import { BusinessCardQR, BusinessProfileEditor } from "@/components/business/business-sections";
import { getBusinessMe } from "@/features/business/live-service";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const me = await getBusinessMe();

  return (
    <>
      <PageShell pageKey="businessProfile" accent="business" />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-[0.7fr_0.3fr] lg:px-10">
        <BusinessProfileEditor me={me} />
        <BusinessCardQR userId={me?.userId} />
      </section>
    </>
  );
}
