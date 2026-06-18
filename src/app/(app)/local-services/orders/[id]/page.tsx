import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DisputeForm, OrderActionButtons, ReviewForm } from "@/components/local-services/LocalServicesForms";
import { formatLocalServiceMoney, getLocalServiceMe, getLocalServiceOrder } from "@/features/local-services/service";

export const dynamic = "force-dynamic";

export default async function LocalServiceOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, me] = await Promise.all([getLocalServiceOrder(id), getLocalServiceMe()]);

  if (!order) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 pb-24 pt-8">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 text-center shadow-luxury">
          <h1 className="hm-display text-4xl text-hm-ink">Auftrag nicht gefunden</h1>
          <Link href="/local-services" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Zurueck</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <Link href="/local-services" className="inline-flex items-center gap-2 text-sm font-bold text-hm-inkSoft hover:text-hm-ink">
        <ChevronLeft className="h-4 w-4" /> Zurueck zu Dienstleistungen
      </Link>
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label">Auftrag</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">{formatLocalServiceMoney(order.totalAmountCents)}</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Info label="Status" value={order.status} />
          <Info label="Gesamtpreis" value={formatLocalServiceMoney(order.totalAmountCents)} />
          {me?.providerProfile?.id === order.providerId ? (
            <>
              <Info label="Plattformprovision" value={formatLocalServiceMoney(order.commissionAmountCents)} />
              <Info label="Auszahlung" value={formatLocalServiceMoney(order.payoutAmountCents)} />
            </>
          ) : (
            <>
              <Info label="Abwicklung" value="HotMess" />
              <Info label="Kontakt" value="geschuetzt" />
            </>
          )}
        </div>
        <div className="mt-6"><OrderActionButtons orderId={order.id} status={order.status} /></div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Bewertung</h2>
          <p className="mt-2 text-sm text-hm-inkSoft">Nach bestaetigter Arbeit kannst du den Anbieter bewerten.</p>
          {["approved_by_customer", "paid_out"].includes(order.status) ? <div className="mt-4"><ReviewForm orderId={order.id} /></div> : null}
        </div>
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Problem melden</h2>
          <p className="mt-2 text-sm text-hm-inkSoft">Bei Streitfall stoppt die Auszahlung bis zur Admin-Pruefung.</p>
          <div className="mt-4"><DisputeForm orderId={order.id} /></div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-hm-ivory px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-hm-inkSoft">{label}</p>
      <p className="mt-1 text-sm font-bold text-hm-ink">{value}</p>
    </div>
  );
}
