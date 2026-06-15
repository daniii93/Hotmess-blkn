import { InvitePartner, TeamStats, TeamTree } from "@/components/partner-sections";

export default function PartnerTeamPage() {
  return <main><TeamTree /><TeamStats /><section className="shell" style={{ marginTop: 20 }}><InvitePartner /></section></main>;
}
