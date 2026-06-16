import { SalesHistory } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerSalesPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><SalesHistory snapshot={snapshot} /></main>;
}
