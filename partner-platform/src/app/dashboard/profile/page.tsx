import { BusinessData, IbanForm, PartnerProfile } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerProfilePage() {
  const snapshot = await getPartnerSnapshot();
  return <main><PartnerProfile snapshot={snapshot} /><BusinessData snapshot={snapshot} /><section className="shell" style={{ marginTop: 20 }}><IbanForm snapshot={snapshot} /></section></main>;
}
