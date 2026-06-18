"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { LocalServiceCategory, LocalServiceLead, LocalServiceOffer } from "@/features/local-services/service";

type ApiState = { status: "idle" | "loading" | "success" | "error"; message?: string };

const urgencyOptions = [
  { value: "immediate", label: "Sofort" },
  { value: "this_week", label: "Diese Woche" },
  { value: "this_month", label: "Diesen Monat" },
  { value: "flexible", label: "Flexibel" },
];

function Notice({ state }: { state: ApiState }) {
  if (state.status === "idle" || state.status === "loading") return null;
  return (
    <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      {state.status === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {state.message}
    </div>
  );
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Das hat nicht funktioniert.");
  return data;
}

export function LocalServiceProjectWizard({ categories }: { categories: LocalServiceCategory[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [form, setForm] = useState({
    categoryId: categories[0]?.id ?? "",
    title: "",
    description: "",
    desiredTimeline: "",
    budgetEuro: "",
    urgency: "flexible",
    address: "",
    zip: "",
    city: "",
    country: "AT",
    radiusKm: "10",
    contactPreference: "platform_chat",
  });

  const selectedCategory = useMemo(() => categories.find((category) => category.id === form.categoryId), [categories, form.categoryId]);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const next = () => setStep((current) => Math.min(6, current + 1));
  const back = () => setStep((current) => Math.max(1, current - 1));

  async function submit() {
    setState({ status: "loading" });
    try {
      const data = await postJson("/api/local-services/projects", {
        ...form,
        budgetEuro: form.budgetEuro ? Number(form.budgetEuro) : null,
        radiusKm: form.radiusKm ? Number(form.radiusKm) : 10,
      });
      setState({ status: "success", message: "Auftrag veroeffentlicht. Passende Anbieter werden informiert." });
      router.push(`/local-services/customer/projects/${data.id}/offers`);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Auftrag konnte nicht erstellt werden." });
    }
  }

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="hm-label">Schritt {step} von 6</p>
      <h1 className="hm-display mt-2 text-4xl text-hm-ink">Auftrag einstellen</h1>

      {step === 1 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => update("categoryId", category.id)}
              className={`rounded-xl border px-4 py-4 text-left transition ${form.categoryId === category.id ? "border-hm-gold bg-hm-champagne" : "border-hm-border bg-hm-ivory hover:border-hm-gold/50"}`}
            >
              <span className="block text-sm font-bold text-hm-ink">{category.name}</span>
              <span className="mt-1 block text-xs text-hm-inkSoft">{category.description}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-4">
          <Input label="Titel" value={form.title} onChange={(value) => update("title", value)} />
          <Textarea label="Beschreibung" value={form.description} onChange={(value) => update("description", value)} />
          <Input label="Gewuenschter Zeitraum" value={form.desiredTimeline} onChange={(value) => update("desiredTimeline", value)} />
          <Input label="Budget optional (EUR)" value={form.budgetEuro} onChange={(value) => update("budgetEuro", value)} type="number" />
          <Select label="Dringlichkeit" value={form.urgency} onChange={(value) => update("urgency", value)} options={urgencyOptions} />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Adresse (bleibt geschuetzt)" value={form.address} onChange={(value) => update("address", value)} />
          <Input label="PLZ" value={form.zip} onChange={(value) => update("zip", value)} />
          <Input label="Ort" value={form.city} onChange={(value) => update("city", value)} />
          <Input label="Land" value={form.country} onChange={(value) => update("country", value)} />
          <Input label="Umkreis km" value={form.radiusKm} onChange={(value) => update("radiusKm", value)} type="number" />
          <p className="rounded-xl bg-hm-ivory px-4 py-3 text-sm text-hm-inkSoft">Vor Leadkauf sehen Anbieter nur grob: {form.city || "Ort"}, Umkreis {form.radiusKm || "10"} km.</p>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 rounded-xl border border-dashed border-hm-gold/40 bg-hm-ivory px-4 py-8 text-sm text-hm-inkSoft">
          Uploads fuer Fotos, PDFs, Plaene und Videos sind vorbereitet. Im MVP werden Dateien spaeter ueber sichere Storage-URLs angehaengt.
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-6 grid gap-3">
          {[
            ["platform_chat", "Nur HotMess-Chat"],
            ["phone_after_acceptance", "Telefon nach Auftragsbestaetigung freigeben"],
            ["platform_visit", "Besichtigungstermin ueber HotMess planen"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => update("contactPreference", value)} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${form.contactPreference === value ? "border-hm-gold bg-hm-champagne" : "border-hm-border bg-hm-ivory"}`}>
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {step === 6 ? (
        <div className="mt-6 grid gap-3 rounded-xl bg-hm-ivory p-4 text-sm text-hm-inkSoft">
          <Summary label="Kategorie" value={selectedCategory?.name ?? "Keine"} />
          <Summary label="Titel" value={form.title || "Offen"} />
          <Summary label="Beschreibung" value={form.description || "Offen"} />
          <Summary label="Zeitraum" value={form.desiredTimeline || "Offen"} />
          <Summary label="Budget" value={form.budgetEuro ? `${form.budgetEuro} EUR` : "Offen"} />
          <Summary label="Standort" value={`${form.city || "Ort offen"}, Umkreis ${form.radiusKm || "10"} km`} />
          <Summary label="Kontakt" value={form.contactPreference} />
        </div>
      ) : null}

      <Notice state={state} />

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={step === 1 ? () => router.push("/local-services") : back} className="rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink">
          Zurueck
        </button>
        {step < 6 ? (
          <button type="button" onClick={next} className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
            Weiter
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={state.status === "loading"} className="inline-flex items-center gap-2 rounded-pill bg-hm-gold px-5 py-3 text-sm font-bold text-hm-ink disabled:opacity-60">
            {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Auftrag veroeffentlichen
          </button>
        )}
      </div>
    </section>
  );
}

export function LocalServiceProviderForm({ categories }: { categories: LocalServiceCategory[] }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [selected, setSelected] = useState<string[]>(categories.slice(0, 2).map((category) => category.id));
  const [form, setForm] = useState({
    description: "",
    baseCity: "",
    baseZip: "",
    serviceRadiusKm: "30",
    emergencyService: false,
    onsiteVisit: true,
    insuranceAvailable: false,
    minOrderEuro: "",
    hourlyRateEuro: "",
  });

  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const toggleCategory = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  async function submit() {
    setState({ status: "loading" });
    try {
      await postJson("/api/local-services/provider/submit", {
        ...form,
        categories: selected,
        serviceRadiusKm: Number(form.serviceRadiusKm),
        minOrderEuro: form.minOrderEuro ? Number(form.minOrderEuro) : null,
        hourlyRateEuro: form.hourlyRateEuro ? Number(form.hourlyRateEuro) : null,
      });
      setState({ status: "success", message: "Zusatzdaten eingereicht. Admin kann dich jetzt freischalten." });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Zusatzdaten konnten nicht gespeichert werden." });
    }
  }

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="hm-label">Anbieter</p>
      <h1 className="hm-display mt-2 text-4xl text-hm-ink">Lokale Dienstleistungen aktivieren</h1>
      <div className="mt-6 grid gap-4">
        <Textarea label="Kurzbeschreibung fuer Kunden" value={form.description} onChange={(value) => update("description", value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Einsatzgebiet Stadt" value={form.baseCity} onChange={(value) => update("baseCity", value)} />
          <Input label="PLZ" value={form.baseZip} onChange={(value) => update("baseZip", value)} />
          <Input label="Radius km" value={form.serviceRadiusKm} onChange={(value) => update("serviceRadiusKm", value)} type="number" />
          <Input label="Mindestauftrag EUR" value={form.minOrderEuro} onChange={(value) => update("minOrderEuro", value)} type="number" />
          <Input label="Stundensatz EUR" value={form.hourlyRateEuro} onChange={(value) => update("hourlyRateEuro", value)} type="number" />
        </div>
        <div>
          <p className="text-sm font-bold text-hm-ink">Dienstleistungskategorien</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => toggleCategory(category.id)} className={`rounded-pill border px-3 py-2 text-xs font-bold ${selected.includes(category.id) ? "border-hm-business bg-hm-business/10 text-hm-business" : "border-hm-border text-hm-inkSoft"}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <Toggle label="Versicherung vorhanden" checked={form.insuranceAvailable} onChange={(value) => update("insuranceAvailable", value)} />
        <Toggle label="Notdienst moeglich" checked={form.emergencyService} onChange={(value) => update("emergencyService", value)} />
        <Toggle label="Besichtigung moeglich" checked={form.onsiteVisit} onChange={(value) => update("onsiteVisit", value)} />
      </div>
      <Notice state={state} />
      <button type="button" onClick={submit} disabled={state.status === "loading"} className="mt-6 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        Zusatzdaten einreichen
      </button>
    </section>
  );
}

export function LeadPurchaseButton({ lead }: { lead: LocalServiceLead }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });

  async function purchase() {
    setState({ status: "loading" });
    try {
      const data = await postJson(`/api/local-services/leads/${lead.id}/purchase`, {});
      setState({ status: "success", message: "Lead gekauft. Chat und Angebot sind freigeschaltet." });
      router.refresh();
      if (data.conversationId) router.push(`/chat/${data.conversationId}`);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Lead konnte nicht gekauft werden." });
    }
  }

  return (
    <div>
      <button type="button" onClick={purchase} disabled={state.status === "loading" || lead.status === "purchased"} className="rounded-pill bg-hm-business px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {lead.status === "purchased" ? "Lead gekauft" : "Lead kaufen"}
      </button>
      <Notice state={state} />
    </div>
  );
}

export function OfferCreateForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    laborEuro: "",
    materialEuro: "",
    otherEuro: "",
    taxEuro: "",
    validUntil: "",
    startDate: "",
    durationDays: "",
    paymentTerms: "100 % nach Fertigstellung",
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    if (!accepted) {
      setState({ status: "error", message: "Bitte bestaetige HotMess-Abwicklung und Kontaktfilter." });
      return;
    }
    setState({ status: "loading" });
    try {
      await postJson("/api/local-services/offers", {
        ...form,
        projectId,
        laborEuro: Number(form.laborEuro || 0),
        materialEuro: Number(form.materialEuro || 0),
        otherEuro: Number(form.otherEuro || 0),
        taxEuro: Number(form.taxEuro || 0),
        durationDays: form.durationDays ? Number(form.durationDays) : null,
      });
      setState({ status: "success", message: "Angebot an Kunden gesendet." });
      router.push("/local-services/company/dashboard");
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Angebot konnte nicht gesendet werden." });
    }
  }

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="hm-label">Angebot</p>
      <h1 className="hm-display mt-2 text-4xl text-hm-ink">Angebot erstellen</h1>
      <div className="mt-6 grid gap-4">
        <Input label="Angebotstitel" value={form.title} onChange={(value) => update("title", value)} />
        <Textarea label="Leistungsbeschreibung" value={form.description} onChange={(value) => update("description", value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Arbeitskosten EUR" value={form.laborEuro} onChange={(value) => update("laborEuro", value)} type="number" />
          <Input label="Materialkosten EUR" value={form.materialEuro} onChange={(value) => update("materialEuro", value)} type="number" />
          <Input label="Sonstige Kosten EUR" value={form.otherEuro} onChange={(value) => update("otherEuro", value)} type="number" />
          <Input label="MwSt. EUR" value={form.taxEuro} onChange={(value) => update("taxEuro", value)} type="number" />
          <Input label="Gueltig bis" value={form.validUntil} onChange={(value) => update("validUntil", value)} type="date" />
          <Input label="Startdatum" value={form.startDate} onChange={(value) => update("startDate", value)} type="date" />
          <Input label="Dauer Tage" value={form.durationDays} onChange={(value) => update("durationDays", value)} type="number" />
        </div>
        <Input label="Zahlungsplan" value={form.paymentTerms} onChange={(value) => update("paymentTerms", value)} />
        <label className="flex gap-3 rounded-xl bg-hm-ivory px-4 py-3 text-sm font-semibold text-hm-ink">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          Ich bestaetige HotMess-Abwicklung, Plattformprovision, Anbieterbedingungen und keine externen Kontaktdaten.
        </label>
      </div>
      <Notice state={state} />
      <button type="button" onClick={submit} disabled={state.status === "loading"} className="mt-6 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
        Angebot an Kunden senden
      </button>
    </section>
  );
}

export function OfferAcceptButton({ offer }: { offer: LocalServiceOffer }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [accepted, setAccepted] = useState(false);

  async function accept() {
    if (!accepted) {
      setState({ status: "error", message: "Bitte AGB und Datenschutz bestaetigen." });
      return;
    }
    setState({ status: "loading" });
    try {
      const data = await postJson(`/api/local-services/offers/${offer.id}/accept`, {});
      router.push(`/checkout/local-services/${data.orderId}`);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Angebot konnte nicht angenommen werden." });
    }
  }

  return (
    <div className="rounded-xl bg-hm-ivory p-4">
      <label className="flex gap-3 text-sm font-semibold text-hm-ink">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        Ich akzeptiere AGB, Datenschutz und verbindliche Vergabe ueber HotMess.
      </label>
      <button type="button" onClick={accept} className="mt-4 rounded-pill bg-hm-gold px-5 py-3 text-sm font-bold text-hm-ink">
        Angebot annehmen
      </button>
      <Notice state={state} />
    </div>
  );
}

export function OrderActionButtons({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });

  async function action(path: string, message: string) {
    setState({ status: "loading" });
    try {
      await postJson(path, {});
      setState({ status: "success", message });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Aktion fehlgeschlagen." });
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {status === "in_progress" ? (
        <button type="button" onClick={() => action(`/api/local-services/orders/${orderId}/complete`, "Arbeit als abgeschlossen markiert.")} className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
          Arbeit abgeschlossen melden
        </button>
      ) : null}
      {status === "completed_by_company" ? (
        <button type="button" onClick={() => action(`/api/local-services/orders/${orderId}/approve`, "Arbeit bestaetigt. Auszahlung vorbereitet.")} className="rounded-pill bg-hm-gold px-5 py-3 text-sm font-bold text-hm-ink">
          Arbeit bestaetigen
        </button>
      ) : null}
      <Notice state={state} />
    </div>
  );
}

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  async function submit() {
    setState({ status: "loading" });
    try {
      await postJson("/api/local-services/reviews", { orderId, rating: Number(rating), punctuality: Number(rating), quality: Number(rating), communication: Number(rating), valueForMoney: Number(rating), comment });
      setState({ status: "success", message: "Bewertung gespeichert." });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Bewertung konnte nicht gespeichert werden." });
    }
  }
  return (
    <div className="grid gap-3">
      <Select label="Sterne" value={rating} onChange={setRating} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} Sterne` }))} />
      <Textarea label="Kommentar" value={comment} onChange={setComment} />
      <button type="button" onClick={submit} className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">Bewertung abgeben</button>
      <Notice state={state} />
    </div>
  );
}

export function DisputeForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const [reason, setReason] = useState("");
  async function submit() {
    setState({ status: "loading" });
    try {
      await postJson("/api/local-services/disputes", { orderId, reason });
      setState({ status: "success", message: "Streitfall eroeffnet. Support prueft den Auftrag." });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Streitfall konnte nicht eroeffnet werden." });
    }
  }
  return (
    <div className="grid gap-3">
      <Textarea label="Problem melden" value={reason} onChange={setReason} />
      <button type="button" onClick={submit} className="rounded-pill border border-red-300 px-5 py-3 text-sm font-bold text-red-700">Problem melden</button>
      <Notice state={state} />
    </div>
  );
}

export function LocalServiceCheckoutButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });

  async function pay() {
    setState({ status: "loading" });
    try {
      const data = await postJson("/api/local-services/checkout/create", { orderId });
      setState({ status: "success", message: "Zahlung erfasst. Auftrag startet." });
      router.push(data.redirectTo ?? `/local-services/orders/${orderId}`);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Checkout konnte nicht gestartet werden." });
    }
  }

  return (
    <div>
      <button type="button" onClick={pay} disabled={state.status === "loading"} className="inline-flex items-center gap-2 rounded-pill bg-hm-gold px-5 py-3 text-sm font-bold text-hm-ink disabled:opacity-60">
        {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Zahlung abschliessen
      </button>
      <Notice state={state} />
    </div>
  );
}

export function AdminProviderActionButtons({ providerId }: { providerId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>({ status: "idle" });

  async function action(kind: "verify" | "reject" | "suspend") {
    setState({ status: "loading" });
    try {
      await postJson(`/api/admin/local-services/providers/${providerId}/${kind}`, {
        reason: kind === "verify" ? "Admin-Freigabe" : "Admin-Entscheidung",
      });
      setState({ status: "success", message: "Anbieterstatus aktualisiert." });
      router.refresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Admin-Aktion fehlgeschlagen." });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => action("verify")} className="rounded-pill bg-emerald-700 px-4 py-2 text-xs font-bold text-white">
        Freischalten
      </button>
      <button type="button" onClick={() => action("reject")} className="rounded-pill border border-hm-gold/30 px-4 py-2 text-xs font-bold text-hm-ink">
        Ablehnen
      </button>
      <button type="button" onClick={() => action("suspend")} className="rounded-pill border border-red-300 px-4 py-2 text-xs font-bold text-red-700">
        Sperren
      </button>
      <Notice state={state} />
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-hm-ink">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-hm-border bg-white px-4 py-3 text-sm outline-none focus:border-hm-gold" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-hm-ink">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="rounded-xl border border-hm-border bg-white px-4 py-3 text-sm outline-none focus:border-hm-gold" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-hm-ink">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-hm-border bg-white px-4 py-3 text-sm outline-none focus:border-hm-gold">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl bg-hm-ivory px-4 py-3 text-sm font-semibold text-hm-ink">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hm-border/70 pb-2">
      <span className="font-semibold text-hm-ink">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
