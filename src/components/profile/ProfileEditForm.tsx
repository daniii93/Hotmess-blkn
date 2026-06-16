"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfileViewModel } from "@/features/profile/live-service";

export function ProfileEditForm({ model }: { model: ProfileViewModel }) {
  const router = useRouter();
  const profile = model.profile;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    coverImageUrl: profile.coverImageUrl ?? "",
    profileMusicUrl: profile.profileMusicUrl ?? "",
    profileMusicTitle: profile.profileMusicTitle ?? "",
    profileMusicArtist: profile.profileMusicArtist ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "AT",
    gender: profile.gender,
    isPrivate: profile.isPrivate,
    showFollowers: profile.showFollowers,
    showFollowing: profile.showFollowing,
    showEventCount: profile.showEventCount,
  });

  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        bio: form.bio || null,
        avatarUrl: form.avatarUrl || null,
        coverImageUrl: form.coverImageUrl || null,
        profileMusicUrl: form.profileMusicUrl || null,
        profileMusicTitle: form.profileMusicTitle || null,
        profileMusicArtist: form.profileMusicArtist || null,
        city: form.city || null,
        country: form.country || null,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Profil konnte nicht gespeichert werden.");
      return;
    }

    setStatus("saved");
    setMessage("Profil gespeichert.");
    router.refresh();
  };

  return (
    <form className="grid gap-5 rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury" onSubmit={save}>
      <div>
        <p className="hm-label">Profil bearbeiten</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Deine Identitaet</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" value={form.firstName} onChange={(value) => update("firstName", value)} />
        <Field label="Nachname" value={form.lastName} onChange={(value) => update("lastName", value)} />
        <Field label="Benutzername" value={form.username} onChange={(value) => update("username", value.toLowerCase())} />
        <Field label="Stadt" value={form.city} onChange={(value) => update("city", value)} />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-hm-ink">
        Bio
        <textarea className="min-h-28 rounded-card border border-hm-border bg-hm-ivory px-4 py-3 font-normal" maxLength={150} value={form.bio} onChange={(event) => update("bio", event.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Profilbild URL" value={form.avatarUrl} onChange={(value) => update("avatarUrl", value)} />
        <Field label="Banner URL" value={form.coverImageUrl} onChange={(value) => update("coverImageUrl", value)} />
        <Field label="Songtitel" value={form.profileMusicTitle} onChange={(value) => update("profileMusicTitle", value)} />
        <Field label="Artist" value={form.profileMusicArtist} onChange={(value) => update("profileMusicArtist", value)} />
        <Field label="Musik-Link" value={form.profileMusicUrl} onChange={(value) => update("profileMusicUrl", value)} />
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Land
          <select className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3 font-normal" value={form.country} onChange={(event) => update("country", event.target.value)}>
            <option value="AT">AT</option>
            <option value="DE">DE</option>
            <option value="CH">CH</option>
            <option value="IT">IT</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-hm-ink">
          Geschlecht
          <select className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3 font-normal" value={form.gender} onChange={(event) => update("gender", event.target.value)}>
            <option value="female">Weiblich</option>
            <option value="male">Maennlich</option>
            <option value="diverse">Divers</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 rounded-card bg-hm-champagne/35 p-4">
        <Switch label="Privates Konto" checked={form.isPrivate} onChange={(value) => update("isPrivate", value)} />
        <Switch label="Follower-Anzahl zeigen" checked={form.showFollowers} onChange={(value) => update("showFollowers", value)} />
        <Switch label="Gefolgt-Anzahl zeigen" checked={form.showFollowing} onChange={(value) => update("showFollowing", value)} />
        <Switch label="Event-Anzahl zeigen" checked={form.showEventCount} onChange={(value) => update("showEventCount", value)} />
      </div>
      {message ? <p className={`rounded-card px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{message}</p> : null}
      <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-hm-porcelain transition hover:bg-hm-gold disabled:opacity-60" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Speichern..." : "Speichern"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-hm-ink">
      {label}
      <input className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm font-semibold text-hm-ink">
      <span>{label}</span>
      <input className="h-5 w-5 accent-hm-gold" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
