import { CheckoutWizard } from "@/components/checkout/checkout-sections";
import { getEventBySlug } from "@/features/events/live-service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type EventCheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventCheckoutPage({ params }: EventCheckoutPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <CheckoutWizard event={event} />
    </main>
  );
}
