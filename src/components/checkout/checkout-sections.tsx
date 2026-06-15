"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LiveEvent } from "@/features/events/live-service";
import { formatMoney } from "@/features/events/format";

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  { title: "Guard", description: "Eingeloggt, verifiziert und nicht gesperrt." },
  { title: "Ticket", description: "Tickettyp wählen und 20 Minuten reservieren." },
  { title: "Gruppe", description: "Allein buchen oder verifizierte Mitglieder zuordnen." },
  { title: "Add-ons", description: "Tisch, Getränke, Fast-Lane und Geburtstag." },
  { title: "Rabatt", description: "Code prüfen und Preis live aktualisieren." },
  { title: "Übersicht", description: "Alle Positionen und AGB bestätigen." },
  { title: "Zahlung", description: "Stripe oder PayPal abschließen." },
];

export function ReservationTimer() {
  return (
    <div className="rounded-pill border border-hm-gold bg-hm-champagne px-4 py-2 text-sm font-semibold text-hm-ink">
      Reservierung: 20:00
    </div>
  );
}

export function GroupMemberPicker() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Für Gruppe buchen?</p>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Mitgliedersuche ist für verifizierte Profile vorbereitet.</p>
    </div>
  );
}

export function TableSelector() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Tisch wählen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">2er, 4er, 6er oder 8er mit Mindestpersonen und Mindestkonsum.</p>
    </div>
  );
}

export function DrinkPackagePicker() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Getränkepaket</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Basic, Standard oder VIP. Girls-Service nur mit Tisch und passenden Paketen.</p>
    </div>
  );
}

export function BirthdayOption() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Geburtstag</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nur mit Tisch. Überraschung bleibt für die betroffene Person unsichtbar.</p>
    </div>
  );
}

export function FastlaneToggle() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Fast-Lane</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Pro Person buchbar und auf dem QR-Ticket sichtbar.</p>
    </div>
  );
}

export function DiscountField() {
  return (
    <label className="block rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <span className="font-semibold text-hm-ink">Rabatt-Code</span>
      <input
        className="mt-3 w-full rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 text-sm outline-none focus:border-hm-gold"
        placeholder="Code eingeben"
      />
    </label>
  );
}

export function CartSummary({ totalCents = 3700 }: { totalCents?: number }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Übersicht</p>
      <div className="mt-4 space-y-2 text-sm text-hm-inkSoft">
        <div className="flex justify-between"><span>Ticket</span><span>{formatMoney(totalCents)}</span></div>
        <div className="flex justify-between"><span>Add-ons</span><span>0 EUR</span></div>
        <div className="flex justify-between border-t border-hm-borderSoft pt-3 font-semibold text-hm-ink"><span>Gesamt</span><span>{formatMoney(totalCents)}</span></div>
      </div>
    </div>
  );
}

export function PaymentStep({ disabled = false, onPay }: { disabled?: boolean; onPay?: () => void }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Zahlung</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={disabled} onClick={onPay} type="button">
          Testzahlung bestaetigen
        </button>
        <button className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink opacity-60" disabled type="button">PayPal folgt</button>
      </div>
    </div>
  );
}

export function CheckoutWizard({ event }: { event: LiveEvent }) {
  const [activeStep, setActiveStep] = useState(1);
  const [ticketTypeId, setTicketTypeId] = useState(event.ticketTypes[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();
  const current = useMemo(() => steps[activeStep], [activeStep]);
  const selectedTicket = event.ticketTypes.find((ticketType) => ticketType.id === ticketTypeId);

  const completeCheckout = async () => {
    if (!ticketTypeId) {
      setStatus("error");
      setMessage("Bitte waehle einen Tickettyp.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const response = await fetch(`/api/events/${event.slug}/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticketTypeId }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; waitlisted?: boolean; position?: number } | null;

    if (!response.ok || payload?.error) {
      setStatus("error");
      setMessage(payload?.error ?? "Checkout konnte nicht abgeschlossen werden.");
      return;
    }

    if (payload?.waitlisted) {
      setStatus("success");
      setMessage(`Dein Kontingent ist voll. Du bist auf Wartelisten-Position ${payload.position}.`);
      router.replace(`/events/${event.slug}/waitlist`);
      return;
    }

    setStatus("success");
    setMessage("Ticket bestaetigt. Dein QR-Code ist jetzt unter Tickets sichtbar.");
    router.replace("/tickets");
    router.refresh();
  };

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Checkout</p>
          <h1 className="hm-display mt-3 text-4xl text-hm-ink">Ticket und Add-ons buchen</h1>
        </div>
        <ReservationTimer />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
        <nav className="space-y-2">
          {steps.map((step, index) => (
            <button
              className={`w-full rounded-card border px-4 py-3 text-left text-sm transition ${
                activeStep === index ? "border-hm-gold bg-hm-champagne text-hm-ink" : "border-hm-borderSoft bg-hm-ivory text-hm-inkSoft"
              }`}
              key={step.title}
              onClick={() => setActiveStep(index)}
              type="button"
            >
              {index}. {step.title}
            </button>
          ))}
        </nav>
        <div className="space-y-4">
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-5">
            <h2 className="text-xl font-semibold text-hm-ink">{current.title}</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{current.description}</p>
          </div>
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-5">
            <p className="font-semibold text-hm-ink">Tickettyp</p>
            <div className="mt-4 grid gap-3">
              {event.ticketTypes.map((ticketType) => (
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-card border p-4 ${
                    ticketTypeId === ticketType.id ? "border-hm-gold bg-hm-champagne" : "border-hm-border bg-hm-porcelain"
                  }`}
                  key={ticketType.id}
                >
                  <span>
                    <span className="block font-semibold text-hm-ink">{ticketType.name}</span>
                    <span className="text-sm text-hm-inkSoft">{formatMoney(ticketType.priceCents, ticketType.currency)}</span>
                  </span>
                  <input checked={ticketTypeId === ticketType.id} onChange={() => setTicketTypeId(ticketType.id)} type="radio" />
                </label>
              ))}
            </div>
          </div>
          <GroupMemberPicker />
          <div className="grid gap-4 sm:grid-cols-2">
            <TableSelector />
            <DrinkPackagePicker />
            <BirthdayOption />
            <FastlaneToggle />
          </div>
          <DiscountField />
          <CartSummary totalCents={selectedTicket?.priceCents ?? 0} />
          <PaymentStep disabled={status === "loading"} onPay={completeCheckout} />
          {message ? (
            <p className={`rounded-card px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SuccessConfetti() {
  return (
    <div className="rounded-card border border-hm-gold bg-hm-champagne p-5 text-hm-ink">
      <p className="font-semibold">Du bist dabei.</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Bestellstatus wird geprüft, danach erscheint dein QR-Ticket.</p>
    </div>
  );
}

export function TicketLink() {
  return (
    <a className="inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white hover:bg-hm-goldDeep" href="/tickets">
      Ticket ansehen
    </a>
  );
}
