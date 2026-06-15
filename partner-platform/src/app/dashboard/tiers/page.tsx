import { TierBenefits, TierLadder } from "@/components/partner-sections";

export default function PartnerTiersPage() {
  return <main><TierLadder /><section className="shell" style={{ marginTop: 20 }}><TierBenefits /></section></main>;
}
