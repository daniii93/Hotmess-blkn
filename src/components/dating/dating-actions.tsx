"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SwipeActionButtons({ candidateId, eventId }: { candidateId: string; eventId?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const swipe = (direction: "left" | "right" | "super") => {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swipedId: candidateId, direction, matchedViaEventId: eventId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Swipe konnte nicht gespeichert werden.");
        return;
      }
      if (payload.matched && payload.conversationId) {
        router.push(`/chat/${payload.conversationId}`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-pill border border-hm-dating/40 px-5 py-3 text-sm font-semibold text-hm-ink" disabled={isPending} onClick={() => swipe("left")} type="button">
          Nein
        </button>
        <button className="rounded-pill border border-hm-dating px-5 py-3 text-sm font-semibold text-hm-dating" disabled={isPending} onClick={() => swipe("super")} type="button">
          SuperLike
        </button>
        <button className="rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" disabled={isPending} onClick={() => swipe("right")} type="button">
          Gefaellt mir
        </button>
      </div>
      {error ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export function DatingProfileForm({
  defaults,
  fallbackName,
}: {
  fallbackName: string;
  defaults?: {
    display_name?: string | null;
    bio?: string | null;
    relationship_goal?: string | null;
    interests?: string[] | null;
    languages?: string[] | null;
    looking_for?: string[] | null;
    pref_age_min?: number | null;
    pref_age_max?: number | null;
    pref_distance_km?: number | null;
    pref_only_event_attendees?: boolean | null;
    pref_only_verified?: boolean | null;
    show_event_history?: boolean | null;
    is_active?: boolean | null;
  } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError("");
    setSaved(false);
    const split = (name: string) =>
      String(formData.get(name) ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const lookingFor = formData.getAll("lookingFor").map(String);

    startTransition(async () => {
      const response = await fetch("/api/dating/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: String(formData.get("displayName") || fallbackName),
          bio: String(formData.get("bio") ?? ""),
          relationshipGoal: String(formData.get("relationshipGoal") || "dates"),
          interests: split("interests"),
          languages: split("languages"),
          lookingFor: lookingFor.length ? lookingFor : ["everyone"],
          prefAgeMin: Number(formData.get("prefAgeMin") || 18),
          prefAgeMax: Number(formData.get("prefAgeMax") || 99),
          prefDistanceKm: Number(formData.get("prefDistanceKm") || 50),
          prefOnlyEventAttendees: formData.get("prefOnlyEventAttendees") === "on",
          prefOnlyVerified: formData.get("prefOnlyVerified") === "on",
          showEventHistory: formData.get("showEventHistory") === "on",
          isActive: formData.get("isActive") === "on",
          photos: [],
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Dating-Profil konnte nicht gespeichert werden.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  const lookingFor = defaults?.looking_for?.length ? defaults.looking_for : ["everyone"];

  return (
    <form action={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-hm-ink">
        Dating-Name
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal outline-none focus:border-hm-dating" name="displayName" defaultValue={defaults?.display_name ?? fallbackName} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-hm-ink">
        Bio
        <textarea className="min-h-32 rounded-card border border-hm-border bg-hm-ivory p-4 font-normal outline-none focus:border-hm-dating" name="bio" maxLength={300} defaultValue={defaults?.bio ?? ""} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Ziel
          <select className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="relationshipGoal" defaultValue={defaults?.relationship_goal ?? "dates"}>
            <option value="casual">Casual</option>
            <option value="dates">Dates</option>
            <option value="relationship">Beziehung</option>
            <option value="open">Offen</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Distanz
          <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="prefDistanceKm" type="number" min={1} max={500} defaultValue={defaults?.pref_distance_km ?? 50} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Alter von
          <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="prefAgeMin" type="number" min={18} max={99} defaultValue={defaults?.pref_age_min ?? 18} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Alter bis
          <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="prefAgeMax" type="number" min={18} max={99} defaultValue={defaults?.pref_age_max ?? 99} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-hm-ink">
        Interessen, mit Komma getrennt
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="interests" defaultValue={(defaults?.interests ?? []).join(", ")} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-hm-ink">
        Sprachen, mit Komma getrennt
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" name="languages" defaultValue={(defaults?.languages ?? []).join(", ")} />
      </label>
      <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
        <p className="text-sm font-semibold text-hm-ink">Ich suche</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-hm-inkSoft">
          {[
            ["women", "Frauen"],
            ["men", "Maenner"],
            ["everyone", "Alle"],
          ].map(([value, label]) => (
            <label className="inline-flex items-center gap-2" key={value}>
              <input name="lookingFor" type="checkbox" value={value} defaultChecked={lookingFor.includes(value)} className="accent-hm-dating" />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-3 text-sm text-hm-inkSoft sm:grid-cols-2">
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <input name="prefOnlyVerified" type="checkbox" defaultChecked={defaults?.pref_only_verified ?? true} className="accent-hm-dating" />
          Nur verifizierte Profile
        </label>
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <input name="prefOnlyEventAttendees" type="checkbox" defaultChecked={defaults?.pref_only_event_attendees ?? false} className="accent-hm-dating" />
          Nur gleiche Events
        </label>
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <input name="showEventHistory" type="checkbox" defaultChecked={defaults?.show_event_history ?? false} className="accent-hm-dating" />
          Events anzeigen
        </label>
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <input name="isActive" type="checkbox" defaultChecked={defaults?.is_active ?? true} className="accent-hm-dating" />
          Profil sichtbar
        </label>
      </div>
      {error ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {saved ? <p className="rounded-card bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Dating-Profil gespeichert.</p> : null}
      <button className="rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending} type="submit">
        Dating-Profil speichern
      </button>
    </form>
  );
}

