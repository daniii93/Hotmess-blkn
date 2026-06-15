import { BusinessData, IbanForm, PartnerProfile } from "@/components/partner-sections";

export default function PartnerProfilePage() {
  return <main><PartnerProfile /><BusinessData /><section className="shell" style={{ marginTop: 20 }}><IbanForm /></section></main>;
}
