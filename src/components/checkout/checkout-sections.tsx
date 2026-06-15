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
  { title: "Ticket", description: "Tickettyp waehlen und 20 Minuten reservieren." },
  { title: "Gruppe", description: "Allein buchen oder verifizierte Mitglieder zuordnen." },
  { title: "Add-ons", description: "Tisch, Getraenke, Fast-Lane und Geburtstag." },
  { title: "Rabatt", description: "Code pruefen und Preis live aktualisieren." },
  { title: "Uebersicht", description: "Alle Positionen und AGB bestaetigen." },
  { title: "Zahlung", description: "Stripe oder PayPal abschliessen." },
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
      <p className="font-semibold text-hm-ink">Fuer Gruppe buchen?</p>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Gruppenbuchung bleibt vorbereitet. Dieser Checkout bucht aktuell ein personalisiertes Ticket.</p>
    </div>
  );
}

export function TableSelector({ tables, value, onChange }: { tables: LiveEvent["tables"]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Tisch waehlen</p>
      <select className="mt-3 w-full rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Kein Tisch</option>
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            {table.name} · {formatMoney(table.priceCents)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DrinkPackagePicker({
  packages,
  value,
  onChange,
  hotmessGirlsService,
  onHotmessGirlsServiceChange,
}: {
  packages: LiveEvent["drinkPackages"];
  value: string;
  onChange: (value: string) => void;
  hotmessGirlsService: boolean;
  onHotmessGirlsServiceChange: (value: boolean) => void;
}) {
  const selected = packages.find((item) => item.id === value);

  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Getraenkepaket</p>
      <select className="mt-3 w-full rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Kein Paket</option>
        {packages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} · {formatMoney(item.priceCents)}
          </option>
        ))}
      </select>
      {selected?.allowsGirlsService ? (
        <label className="mt-3 flex items-center gap-2 text-sm text-hm-inkSoft">
          <input checked={hotmessGirlsService} onChange={(event) => onHotmessGirlsServiceChange(event.target.checked)} type="checkbox" />
          HotMess Girls Service
        </label>
      ) : null}
    </div>
  );
}

export function BirthdayOption({ packages, value, onChange }: { packages: LiveEvent["birthdayPackages"]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Geburtstag</p>
      <select className="mt-3 w-full rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Kein Geburtstagspaket</option>
        {packages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} · {formatMoney(item.priceCents)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FastlaneToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Fast-Lane</p>
      <label className="mt-3 flex items-center gap-2 text-sm text-hm-inkSoft">
        <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        Fast-Lane fuer {formatMoney(1200)} buchen
      </label>
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

export function CartSummary({ ticketCents, addonCents }: { ticketCents: number; addonCents: number }) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Uebersicht</p>
      <div className="mt-4 space-y-2 text-sm text-hm-inkSoft">
        <div className="flex justify-between">
          <span>Ticket</span>
          <span>{formatMoney(ticketCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Add-ons</span>
          <span>{formatMoney(addonCents)}</span>
        </div>
        <div className="flex justify-between border-t border-hm-borderSoft pt-3 font-semibold text-hm-ink">
          <span>Gesamt</span>
          <span>{formatMoney(ticketCents + addonCents)}</span>
        </div>
      </div>
    </div>
  );
}

export function PaymentStep({
  disabled,
  provider,
  onProviderChange,
  onPay,
}: {
  disabled: boolean;
  provider: "stripe" | "paypal";
  onProviderChange: (provider: "stripe" | "paypal") => void;
  onPay: () => void;
}) {
  return (
    <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
      <p className="font-semibold text-hm-ink">Zahlung</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(["stripe", "paypal"] as const).map((item) => (
          <button
            className={`rounded-pill border px-4 py-3 text-sm font-semibold ${provider === item ? "border-hm-gold bg-hm-champagne text-hm-ink" : "border-hm-border text-hm-inkSoft"}`}
            key={item}
            onClick={() => onProviderChange(item)}
            type="button"
          >
            {item === "stripe" ? "Stripe / Karte" : "PayPal"}
          </button>
        ))}
      </div>
      <button className="mt-4 rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={disabled} onClick={onPay} type="button">
        {disabled ? "Bereite Zahlung vor..." : "Zur Zahlung"}
      </button>
    </div>
  );
}

export function CheckoutWizard({ event }: { event: LiveEvent }) {
  const [activeStep, setActiveStep] = useState(1);
  const [ticketTypeId, setTicketTypeId] = useState(event.ticketTypes[0]?.id ?? "");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paypal">("stripe");
  const [tableId, setTableId] = useState("");
  const [drinkPackageId, setDrinkPackageId] = useState("");
  const [birthdayPackageId, setBirthdayPackageId] = useState("");
  const [fastlane, setFastlane] = useState(false);
  const [hotmessGirlsService, setHotmessGirlsService] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();
  const current = useMemo(() => steps[activeStep], [activeStep]);
  const selectedTicket = event.ticketTypes.find((ticketType) => ticketType.id === ticketTypeId);
  const selectedTable = event.tables.find((table) => table.id === tableId);
  const selectedDrink = event.drinkPackages.find((item) => item.id === drinkPackageId);
  const selectedBirthday = event.birthdayPackages.find((item) => item.id === birthdayPackageId);
  const addonCents = (selectedTable?.priceCents ?? 0) + (selectedDrink?.priceCents ?? 0) + (selectedBirthday?.priceCents ?? 0) + (fastlane ? 1200 : 0);

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
      body: JSON.stringify({
        ticketTypeId,
        paymentProvider,
        addons: {
          tableId: tableId || undefined,
          drinkPackageId: drinkPackageId || undefined,
          birthdayPackageId: birthdayPackageId || undefined,
          fastlane,
          hotmessGirlsService,
        },
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; waitlisted?: boolean; position?: number; checkoutUrl?: string } | null;

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

    if (payload?.checkoutUrl) {
      window.location.assign(payload.checkoutUrl);
      return;
    }

    setStatus("error");
    setMessage("Zahlungslink fehlt. Bitte versuche es erneut.");
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
            <TableSelector tables={event.tables} value={tableId} onChange={setTableId} />
            <DrinkPackagePicker
              packages={event.drinkPackages}
              value={drinkPackageId}
              onChange={setDrinkPackageId}
              hotmessGirlsService={hotmessGirlsService}
              onHotmessGirlsServiceChange={setHotmessGirlsService}
            />
            <BirthdayOption packages={event.birthdayPackages} value={birthdayPackageId} onChange={setBirthdayPackageId} />
            <FastlaneToggle checked={fastlane} onChange={setFastlane} />
          </div>
          <DiscountField />
          <CartSummary ticketCents={selectedTicket?.priceCents ?? 0} addonCents={addonCents} />
          <PaymentStep disabled={status === "loading"} provider={paymentProvider} onProviderChange={setPaymentProvider} onPay={completeCheckout} />
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
      <p className="mt-2 text-sm text-hm-inkSoft">Nach Zahlungsbestaetigung erscheint dein QR-Ticket automatisch unter Tickets.</p>
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
