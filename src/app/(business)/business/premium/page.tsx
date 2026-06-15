import { PageShell } from "@/components/shell/page-shell";
import { BusinessPlusUpsell } from "@/components/business/business-sections";

export default function BusinessPremiumPage() {
  return (
    <>
      <PageShell pageKey="businessPremium" accent="business" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <BusinessPlusUpsell />
      </section>
    </>
  );
}
