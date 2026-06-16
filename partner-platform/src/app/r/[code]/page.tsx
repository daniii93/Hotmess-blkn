import { redirect } from "next/navigation";
import { mainAppUrl, trackPartnerClick } from "@/lib/partner-data";

type Props = {
  params: Promise<{ code: string }>;
};

export const dynamic = "force-dynamic";

export default async function ReferralPage({ params }: Props) {
  const { code } = await params;
  await trackPartnerClick(code, "link");
  redirect(`${mainAppUrl()}/events?ref=${encodeURIComponent(code)}&utm_source=partner&utm_medium=referral`);
}
