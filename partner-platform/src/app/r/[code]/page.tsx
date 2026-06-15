import { ReferralRedirect } from "@/components/partner-sections";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  return <main><ReferralRedirect code={code} /></main>;
}
