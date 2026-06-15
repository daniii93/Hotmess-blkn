import { EventLanding } from "@/components/partner-sections";

type Props = {
  params: Promise<{ code: string; event: string }>;
};

export default async function PersonalEventLandingPage({ params }: Props) {
  const { code, event } = await params;
  return <main><EventLanding code={code} event={event} /></main>;
}
