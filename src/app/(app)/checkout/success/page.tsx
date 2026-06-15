import { SuccessConfetti, TicketLink } from "@/components/checkout/checkout-sections";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Checkout</p>
        <h1 className="hm-display mt-4 text-5xl text-hm-ink">Ticket wird bestätigt</h1>
        <p className="mt-5 max-w-2xl leading-8 text-hm-inkSoft">
          Wir prüfen den Zahlungsstatus. Sobald die Zahlung bestätigt ist, wird dein personalisiertes QR-Ticket erzeugt.
        </p>
        <div className="mt-8 space-y-5">
          <SuccessConfetti />
          <TicketLink />
        </div>
      </section>
    </main>
  );
}
