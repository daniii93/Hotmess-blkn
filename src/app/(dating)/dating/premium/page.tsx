import { PageShell } from "@/components/shell/page-shell";
import { ConsumableShop, PremiumTiers } from "@/components/dating/dating-sections";

export default function DatingPremiumPage() {
  return (
    <>
      <PageShell pageKey="datingPremium" accent="dating" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <PremiumTiers />
        <ConsumableShop />
      </section>
    </>
  );
}
