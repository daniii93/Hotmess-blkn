import { PayoutHistory, PayoutRequest } from "@/components/partner-sections";

export default function PartnerPayoutsPage() {
  return <main><section className="shell" style={{ marginTop: 24 }}><PayoutRequest /></section><PayoutHistory /></main>;
}
