import { EventLanding } from "@/components/partner-sections";
import { trackPartnerClick } from "@/lib/partner-data";

type Props = {
  params: Promise<{ code: string; event: string }>;
};

export const dynamic = "force-dynamic";

export default async function PersonalEventLandingPage({ params }: Props) {
  const { code, event } = await params;
  await trackPartnerClick(code, "landing");
  return <main><EventLanding code={code} event={event} /></main>;
}
