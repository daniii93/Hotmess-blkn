import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LocalServiceCheckoutButton } from "@/components/local-services/LocalServicesForms";
import { formatLocalServiceMoney, getLocalServiceOrder } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceCheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getLocalServiceOrder(orderId);

  if (!order) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
          <h1 className="hm-display text-4xl text-hm-ink">Checkout nicht gefunden</h1>
          <Link href="/local-services" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Zurueck</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href={`/local-services/customer/projects/${order.projectId}/offers`} className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zu Angeboten
      </Link>
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
        <p className="hm-label mt-5">Sicherer Checkout</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Auftrag verbindlich buchen</h1>
        <div className="mt-5 grid gap-3 rounded-xl bg-hm-ivory p-4">
          <Line label="Gesamtpreis fuer dich" value={formatLocalServiceMoney(order.totalAmountCents)} />
          <Line label="Status" value={order.status} />
        </div>
        <p className="mt-4 text-sm leading-6 text-hm-inkSoft">Nach Abschluss wird der Auftrag gestartet und die weitere Abstimmung laeuft ueber HotMess.</p>
        <div className="mt-6"><LocalServiceCheckoutButton orderId={order.id} /></div>
      </section>
    </main>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hm-border/70 pb-2 text-sm">
      <span className="font-semibold text-hm-ink">{label}</span>
      <span className="text-right text-hm-inkSoft">{value}</span>
    </div>
  );
}
