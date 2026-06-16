import { InvitePartner, TeamStats, TeamTree } from "@/components/partner-sections";
import { getPartnerSnapshot } from "@/lib/partner-data";

export const dynamic = "force-dynamic";

export default async function PartnerTeamPage() {
  const snapshot = await getPartnerSnapshot();
  return <main><TeamTree snapshot={snapshot} /><TeamStats snapshot={snapshot} /><section className="shell" style={{ marginTop: 20 }}><InvitePartner snapshot={snapshot} /></section></main>;
}
