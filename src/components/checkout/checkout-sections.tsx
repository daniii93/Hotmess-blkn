"use client";

import { useMemo, useState } from "react";

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

export function CartSummary() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Übersicht</p>
      <div className="mt-4 space-y-2 text-sm text-hm-inkSoft">
        <div className="flex justify-between"><span>Regular Ticket</span><span>25 EUR</span></div>
        <div className="flex justify-between"><span>Fast-Lane</span><span>12 EUR</span></div>
        <div className="flex justify-between border-t border-hm-borderSoft pt-3 font-semibold text-hm-ink"><span>Gesamt</span><span>37 EUR</span></div>
      </div>
    </div>
  );
}

export function PaymentStep() {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Zahlung</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" type="button">Stripe</button>
        <button className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" type="button">PayPal</button>
      </div>
    </div>
  );
}

export function CheckoutWizard() {
  const [activeStep, setActiveStep] = useState(1);
  const current = useMemo(() => steps[activeStep], [activeStep]);

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
          <GroupMemberPicker />
          <div className="grid gap-4 sm:grid-cols-2">
            <TableSelector />
            <DrinkPackagePicker />
            <BirthdayOption />
            <FastlaneToggle />
          </div>
          <DiscountField />
          <CartSummary />
          <PaymentStep />
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
