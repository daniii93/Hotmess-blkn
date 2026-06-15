"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LiveEvent } from "@/features/events/live-service";
import { formatEventDate, formatMoney } from "@/features/events/format";

export function AdminLiveEvents({ events }: { events: LiveEvent[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const createEvent = async (formData: FormData) => {
    setStatus("loading");
    setMessage(null);

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        slug: formData.get("slug"),
        city: formData.get("city"),
        country: "AT",
        venueName: formData.get("venueName"),
        address: formData.get("address"),
        category: formData.get("category"),
        dateStart: formData.get("dateStart"),
        capacityTotal: formData.get("capacityTotal"),
        ticketName: formData.get("ticketName"),
        ticketPriceCents: Number(formData.get("ticketPriceEuros")) * 100,
        publish: true,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok || payload?.error) {
      setStatus("error");
      setMessage(payload?.error ?? "Event konnte nicht erstellt werden.");
      return;
    }

    setStatus("success");
    setMessage("Event wurde publiziert.");
    router.refresh();
  };

  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-admin">Live Event-Verwaltung</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Event aus Supabase erstellen</h2>
      <form action={createEvent} className="mt-5 grid gap-3 rounded-card border border-hm-borderSoft bg-hm-ivory p-4 md:grid-cols-3">
        {[
          ["title", "HotMess Innsbruck", "text"],
          ["slug", "hotmess-innsbruck", "text"],
          ["city", "Innsbruck", "text"],
          ["venueName", "Venue Name", "text"],
          ["address", "Adresse", "text"],
          ["category", "club", "text"],
          ["dateStart", "2026-09-12T20:00", "datetime-local"],
          ["capacityTotal", "400", "number"],
          ["ticketName", "Regular", "text"],
          ["ticketPriceEuros", "25", "number"],
        ].map(([name, placeholder, type]) => (
          <input
            className="rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 text-sm outline-none focus:border-hm-admin"
            key={name}
            name={name}
            placeholder={placeholder}
            required
            type={type}
          />
        ))}
        <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-3" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Speichere..." : "Event publizieren"}
        </button>
      </form>
      {message ? (
        <p className={`mt-4 rounded-card px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
          {message}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-luxury text-hm-inkSoft">
              <th className="pb-3 pr-4">Event</th>
              <th className="pb-3 pr-4">Datum</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Kontingent</th>
              <th className="pb-3 pr-4">Ticket ab</th>
              <th className="pb-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="text-hm-ink">
            {events.map((event) => (
              <tr className="border-t border-hm-borderSoft" key={event.id}>
                <td className="py-3 pr-4">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-xs text-hm-inkSoft">{event.venue?.name ?? event.city}</p>
                </td>
                <td className="pr-4">{formatEventDate(event.dateStart)}</td>
                <td className="pr-4">{event.status}</td>
                <td className="pr-4">
                  {event.genderConfig
                    ? `W ${event.genderConfig.soldFemale}/${event.genderConfig.capacityFemale} · M ${event.genderConfig.soldMale}/${event.genderConfig.capacityMale}`
                    : "-"}
                </td>
                <td className="pr-4">
                  {event.ticketTypes.length > 0 ? formatMoney(Math.min(...event.ticketTypes.map((ticketType) => ticketType.priceCents))) : "-"}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink" href={`/events/${event.slug}`}>
                      Ansehen
                    </Link>
                    <Link className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs text-hm-ink" href={`/admin/events/${event.slug}/sales`}>
                      Sales
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr className="border-t border-hm-borderSoft">
                <td className="py-4 text-hm-inkSoft" colSpan={6}>
                  Noch keine Events in Supabase.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
