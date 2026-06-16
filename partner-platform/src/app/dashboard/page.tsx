import { ActivityFeed, PartnerKpis, TierProgress } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><PartnerKpis snapshot={snapshot} /><TierProgress snapshot={snapshot} /><ActivityFeed snapshot={snapshot} /></main>;
}
