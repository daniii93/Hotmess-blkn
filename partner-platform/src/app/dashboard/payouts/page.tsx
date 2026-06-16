import { PayoutHistory, PayoutRequest } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerPayoutsPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><section className="shell" style={{ marginTop: 24 }}><PayoutRequest snapshot={snapshot} /></section><PayoutHistory snapshot={snapshot} /></main>;
}
