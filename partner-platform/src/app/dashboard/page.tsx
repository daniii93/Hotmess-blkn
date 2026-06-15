import { ActivityFeed, PartnerKpis, TierProgress } from "@/components/partner-sections";

export default function PartnerDashboardPage() {
  return <main><PartnerKpis /><TierProgress /><ActivityFeed /></main>;
}
