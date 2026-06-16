import { MaterialLibrary } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerMaterialsPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><MaterialLibrary snapshot={snapshot} /></main>;
}
