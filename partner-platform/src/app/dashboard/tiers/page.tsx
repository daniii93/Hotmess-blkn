import { TierBenefits, TierLadder } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerTiersPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><TierLadder snapshot={snapshot} /><section className="shell" style={{ marginTop: 20 }}><TierBenefits /></section></main>;
}
