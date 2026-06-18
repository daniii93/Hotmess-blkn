import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Gift, Hotel, ReceiptText, RotateCcw, Ticket, WalletCards, Wrench } from "lucide-react";
import { getWalletData } from "@/features/wallet/service";
import { formatMoney } from "@/features/events/format";
import type { WalletItemType } from "@/features/wallet/types";

export const dynamic = "force-dynamic";

const iconMap: Record<WalletItemType, ReactNode> = {
  ticket: <Ticket className="h-5 w-5" />,
  event_addon: <BadgeCheck className="h-5 w-5" />,
  hotel_code: <Hotel className="h-5 w-5" />,
  benefit: <Gift className="h-5 w-5" />,
  membership: <CreditCard className="h-5 w-5" />,
  local_service_order: <Wrench className="h-5 w-5" />,
  refund: <RotateCcw className="h-5 w-5" />,
  discount_code: <Gift className="h-5 w-5" />,
};

export default async function WalletPage() {
  const data = await getWalletData();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Wallet</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">Alles, was du auf HotMess besitzt oder nutzen kannst.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
          Wallet ist kein Bankkonto und kein Guthaben-System. Es ist deine persoenliche Uebersicht fuer Tickets,
          Add-ons, Hotelcodes, Benefits, Memberships, Auftraege und Refund-Status.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Tickets" value={data.counts.tickets} />
        <Metric label="Add-ons" value={data.counts.addons} />
        <Metric label="Hotelcodes" value={data.counts.hotelCodes} />
        <Metric label="Auftraege" value={data.counts.serviceOrders} />
        <Metric label="Memberships" value={data.counts.memberships} />
        <Metric label="Benefits" value={data.counts.benefits} />
      </section>

      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-hm-ink">Meine Wallet Items</h2>
            <p className="mt-1 text-sm text-hm-inkSoft">Nur eigene Inhalte, keine fremden Tickets, keine Zahlungsdaten.</p>
          </div>
          <Link href="/tickets" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
            Tickets <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.items.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.items.map((item) => (
              <Link key={item.id} href={item.href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{iconMap[item.type]}</span>
                  <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{item.status}</span>
                </div>
                <h3 className="mt-4 text-sm font-black text-hm-ink">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{item.text}</p>
                {typeof item.amountCents === "number" ? (
                  <p className="mt-3 text-sm font-bold text-hm-ink">{formatMoney(item.amountCents, item.currency ?? "EUR")}</p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
            <WalletCards className="h-6 w-6 text-hm-goldDeep" />
            <p className="mt-3 text-sm leading-6 text-hm-inkSoft">{data.empty}</p>
            <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
              Events ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Tickets & QR" text="Tickets bleiben weiterhin unter /tickets nutzbar und werden hier nur gebuendelt." href="/tickets" icon={<Ticket className="h-5 w-5" />} />
        <InfoCard title="Benefits & Codes" text="Hotelcodes und Vorteile erscheinen nur, wenn echte Eintraege vorhanden sind." href="/benefits" icon={<Gift className="h-5 w-5" />} />
        <InfoCard title="Auftraege & Belege" text="Dienstleistungsauftraege und Refunds werden nur fuer berechtigte Nutzer angezeigt." href="/local-services" icon={<ReceiptText className="h-5 w-5" />} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-luxury">
      <p className="font-display text-3xl text-hm-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{label}</p>
    </div>
  );
}

function InfoCard({ title, text, href, icon }: { title: string; text: string; href: string; icon: ReactNode }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
    </Link>
  );
}
