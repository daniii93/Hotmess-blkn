import { ReferralTools, ShareTemplates } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerToolsPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><ReferralTools snapshot={snapshot} /><ShareTemplates snapshot={snapshot} /></main>;
}
