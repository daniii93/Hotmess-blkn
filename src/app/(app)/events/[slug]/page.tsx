import {
  AddonPreview,
  EventHero,
  GenderCapacityLive,
  HotelPerkCard,
  TicketTypeList,
  WhoIsGoing,
} from "@/components/events/event-sections";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <EventHero slug={slug} />
      <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr]">
        <div className="space-y-6">
          <GenderCapacityLive />
          <WhoIsGoing />
          <TicketTypeList />
        </div>
        <div className="space-y-6">
          <HotelPerkCard />
          <AddonPreview />
        </div>
      </div>
    </main>
  );
}
