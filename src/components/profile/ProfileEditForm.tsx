"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileLink, ProfilePost, ProfileViewModel } from "@/features/profile/live-service";

type SheetName = "avatar" | "name" | "username" | "pronouns" | "bio" | "links" | "banner" | "grid" | "gender" | null;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const pronounOptions = ["er/ihm", "sie/ihr", "they/them", "keine Angabe"];
const genderLabels = { female: "Frau", male: "Mann", diverse: "Divers" } as const;

const dateLabel = (value: string | null, days: number) => {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date > new Date() ? date.toLocaleDateString("de-DE") : null;
};

export function ProfileEditForm({ model }: { model: ProfileViewModel }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = model.profile;
  const [activeSheet, setActiveSheet] = useState<SheetName>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gridPosts, setGridPosts] = useState<ProfilePost[]>(model.posts);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    pronouns: profile.pronouns,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    coverImageUrl: profile.coverImageUrl ?? "",
    profileMusicUrl: profile.profileMusicUrl ?? "",
    profileMusicTitle: profile.profileMusicTitle ?? "",
    profileMusicArtist: profile.profileMusicArtist ?? "",
    gender: profile.gender,
    aiCreatorLabel: profile.aiCreatorLabel,
    links: model.links.length ? model.links : [{ id: "new-0", label: "", url: "", sortOrder: 0 } satisfies ProfileLink],
  });

  const nameBlockedUntil = useMemo(() => dateLabel(profile.nameChangedAt, 30), [profile.nameChangedAt]);
  const usernameBlockedUntil = useMemo(() => dateLabel(profile.usernameChangedAt, 30), [profile.usernameChangedAt]);
  const genderBlockedUntil = useMemo(() => dateLabel(profile.genderChangedAt, 90), [profile.genderChangedAt]);

  useEffect(() => {
    if (!form.username || form.username === profile.username || !/^[a-z0-9._]{3,30}$/.test(form.username)) {
      setUsernameAvailable(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/profile?username=${encodeURIComponent(form.username)}`);
      const payload = (await response.json().catch(() => null)) as { available?: boolean } | null;
      setUsernameAvailable(Boolean(payload?.available));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [form.username, profile.username]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async (payload: Record<string, unknown>, success = "Gespeichert.") => {
    setStatus("saving");
    setMessage(null);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(body?.error ?? "Aenderung konnte nicht gespeichert werden.");
      return false;
    }

    setStatus("saved");
    setMessage(success);
    setActiveSheet(null);
    router.refresh();
    return true;
  };

  const saveGrid = async () => {
    setStatus("saving");
    const response = await fetch("/api/profile/grid", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postIds: gridPosts.map((post) => post.id) }),
    });
    setStatus(response.ok ? "saved" : "error");
    setMessage(response.ok ? "Raster gespeichert." : "Raster konnte nicht gespeichert werden.");
    if (response.ok) setActiveSheet(null);
    router.refresh();
  };

  const movePost = (index: number, direction: -1 | 1) => {
    setGridPosts((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${profile.id}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

    if (error) {
      setUploading(false);
      setStatus("error");
      setMessage("Upload fehlgeschlagen. Bitte pruefe den Storage-Bucket 'avatars'.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update("avatarUrl", data.publicUrl);
    await saveProfile({ avatarUrl: data.publicUrl }, "Profilbild gespeichert.");
    setUploading(false);
  };

  const primaryLink = form.links.find((link) => link.label || link.url);
  const cleanLinks = form.links
    .filter((link) => link.label.trim() && link.url.trim())
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }));

  return (
    <main className="min-h-screen bg-hm-ivory pb-28 text-hm-ink">
      <header className="sticky top-0 z-20 grid grid-cols-[44px_1fr_44px] items-center border-b border-hm-gold/15 bg-hm-ivory/90 px-4 py-3 backdrop-blur-xl">
        <Link className="grid h-10 w-10 place-items-center rounded-full bg-hm-porcelain shadow-soft" href="/profile" aria-label="Zurueck">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-center font-serif text-xl font-semibold">Profil bearbeiten</h1>
        <span />
      </header>

      <section className="mx-auto max-w-xl px-4 py-6">
        <div className="flex items-center justify-center gap-8">
          <button className="grid gap-2 text-center" type="button" onClick={() => setActiveSheet("avatar")}>
            <AvatarCircle imageUrl={form.avatarUrl} label={`${form.firstName} ${form.lastName}`} />
            <span className="text-xs font-semibold text-hm-inkSoft">Foto</span>
          </button>
          <div className="grid gap-2 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-hm-gold/25 bg-hm-champagne text-xl font-serif font-bold text-hm-ink shadow-soft">HM</div>
            <span className="text-xs font-semibold text-hm-inkSoft">AI-Avatar</span>
          </div>
        </div>
        <button className="mx-auto mt-4 block text-sm font-bold text-hm-goldDeep" type="button" onClick={() => setActiveSheet("avatar")}>
          Bild oder Avatar bearbeiten
        </button>
      </section>

      <section className="mx-auto max-w-xl overflow-hidden rounded-card border border-hm-gold/15 bg-hm-porcelain shadow-soft">
        <EditRow label="Name" value={`${form.firstName} ${form.lastName}`.trim()} onClick={() => setActiveSheet("name")} />
        <EditRow label="Benutzername" value={form.username} onClick={() => setActiveSheet("username")} />
        <EditRow label="Pronomen" value={form.pronouns.length ? form.pronouns.join(", ") : "Pronomen"} muted={!form.pronouns.length} onClick={() => setActiveSheet("pronouns")} />
        <EditRow label="Bio" value={form.bio || "Bio hinzufuegen"} muted={!form.bio} onClick={() => setActiveSheet("bio")} />
        <EditRow label="Links" value={primaryLink ? primaryLink.label || "Link" : "Links hinzufuegen"} muted={!primaryLink} onClick={() => setActiveSheet("links")} />
      </section>

      <section className="mx-auto mt-5 max-w-xl overflow-hidden rounded-card border border-hm-gold/15 bg-hm-porcelain shadow-soft">
        <EditRow label="Banner" value={form.coverImageUrl ? "Titelbild aktiv" : "Banner hinzu."} onClick={() => setActiveSheet("banner")} />
        <p className="px-4 pb-4 text-sm text-hm-inkSoft">Fuege Musik, Profile und mehr hinzu.</p>
      </section>

      <section className="mx-auto mt-5 max-w-xl overflow-hidden rounded-card border border-hm-gold/15 bg-hm-porcelain shadow-soft">
        <EditRow label="Raster neu anordnen" value="Neu" badge onClick={() => setActiveSheet("grid")} />
      </section>

      <section className="mx-auto mt-5 max-w-xl overflow-hidden rounded-card border border-hm-gold/15 bg-hm-porcelain shadow-soft">
        <EditRow label="Geschlecht" value={genderLabels[form.gender]} onClick={() => setActiveSheet("gender")} />
      </section>

      <section className="mx-auto mt-5 max-w-xl rounded-card border border-hm-gold/15 bg-hm-porcelain p-4 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-hm-ink">KI-Creator</p>
            <p className="mt-1 text-sm leading-6 text-hm-inkSoft">Fuege deinem Profil dieses Label hinzu, wenn du in deinen Inhalten haeufig KI verwendest. <span className="font-semibold text-hm-goldDeep">Mehr dazu</span></p>
          </div>
          <button
            className={`relative h-8 w-14 rounded-full transition ${form.aiCreatorLabel ? "bg-hm-ink" : "bg-hm-champagne"}`}
            type="button"
            aria-label="KI-Creator umschalten"
            onClick={async () => {
              const next = !form.aiCreatorLabel;
              update("aiCreatorLabel", next);
              await saveProfile({ aiCreatorLabel: next }, "KI-Creator Label gespeichert.");
            }}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft transition ${form.aiCreatorLabel ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-xl gap-3 px-1 text-sm font-semibold text-hm-goldDeep">
        <Link href="/business/profile">Zu professionellem Konto wechseln</Link>
        <Link href="/settings">Einstellungen zu personenbez. Informationen</Link>
        <Link href="/verify">Zeige anderen, dass dein Profil verif. ist</Link>
      </section>

      {message ? (
        <div className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-xl rounded-card px-4 py-3 text-sm shadow-luxury ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      ) : null}

      <input ref={fileInputRef} className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadAvatar(event.target.files[0])} />

      <AnimatePresence>
        {activeSheet ? (
          <EditSheet title={sheetTitle(activeSheet)} onClose={() => setActiveSheet(null)}>
            {activeSheet === "avatar" ? (
              <div className="grid gap-3">
                <p className="rounded-card bg-hm-champagne/45 p-3 text-sm text-hm-inkSoft">Nutze ein klares Gesichtsfoto. Dieses Foto wird spaeter auch fuer Ticket-Check-in-Snapshots verwendet.</p>
                <button className="rounded-xl bg-hm-ink px-4 py-3 text-sm font-bold text-white" type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Upload..." : "Aus Galerie waehlen"}
                </button>
                <button className="rounded-xl bg-hm-champagne px-4 py-3 text-sm font-bold text-hm-ink" type="button" onClick={() => fileInputRef.current?.click()}>Neues Foto aufnehmen</button>
                <Field label="Bild-URL" value={form.avatarUrl} onChange={(value) => update("avatarUrl", value)} />
                <button className="rounded-xl bg-hm-gold px-4 py-3 text-sm font-bold text-hm-ink" type="button" onClick={() => saveProfile({ avatarUrl: form.avatarUrl || null })}>Speichern</button>
                <button className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" type="button" onClick={() => { update("avatarUrl", ""); saveProfile({ avatarUrl: null }, "Profilbild entfernt."); }}>Aktuelles Foto entfernen</button>
              </div>
            ) : null}

            {activeSheet === "name" ? (
              <div className="grid gap-4">
                {nameBlockedUntil ? <Hint text={`Du kannst deinen Namen alle 30 Tage aendern. Naechste Aenderung ab ${nameBlockedUntil}.`} /> : null}
                <Field label="Vorname" value={form.firstName} onChange={(value) => update("firstName", value)} />
                <Field label="Nachname" value={form.lastName} onChange={(value) => update("lastName", value)} />
                <SaveButton disabled={Boolean(nameBlockedUntil)} status={status} onClick={() => saveProfile({ firstName: form.firstName, lastName: form.lastName })} />
              </div>
            ) : null}

            {activeSheet === "username" ? (
              <div className="grid gap-4">
                {usernameBlockedUntil ? <Hint text={`Du kannst deinen Benutzernamen alle 30 Tage aendern. Naechste Aenderung ab ${usernameBlockedUntil}.`} /> : null}
                <Field label="Benutzername" value={form.username} onChange={(value) => update("username", value.toLowerCase().replace(/[^a-z0-9._]/g, ""))} />
                <p className={`text-sm ${usernameAvailable === false ? "text-red-700" : "text-hm-inkSoft"}`}>
                  {usernameAvailable === null ? "3-30 Zeichen: a-z, 0-9, Punkt oder Unterstrich." : usernameAvailable ? "Benutzername ist verfuegbar." : "Benutzername ist vergeben."}
                </p>
                <SaveButton disabled={Boolean(usernameBlockedUntil) || usernameAvailable === false} status={status} onClick={() => saveProfile({ username: form.username })} />
              </div>
            ) : null}

            {activeSheet === "pronouns" ? (
              <div className="grid gap-3">
                {pronounOptions.map((option) => {
                  const selected = form.pronouns.includes(option);
                  return (
                    <button key={option} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${selected ? "border-hm-ink bg-hm-ink text-white" : "border-hm-border bg-hm-ivory text-hm-ink"}`} type="button" onClick={() => {
                      const next = selected ? form.pronouns.filter((item) => item !== option) : [...form.pronouns, option].slice(0, 4);
                      update("pronouns", next);
                    }}>
                      {option}
                    </button>
                  );
                })}
                <SaveButton status={status} onClick={() => saveProfile({ pronouns: form.pronouns })} />
              </div>
            ) : null}

            {activeSheet === "bio" ? (
              <div className="grid gap-3">
                <textarea className="min-h-36 rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm outline-none focus:border-hm-gold" maxLength={150} value={form.bio} onChange={(event) => update("bio", event.target.value)} />
                <p className="text-right text-xs font-semibold text-hm-inkSoft">{form.bio.length}/150</p>
                <SaveButton status={status} onClick={() => saveProfile({ bio: form.bio || null })} />
              </div>
            ) : null}

            {activeSheet === "links" ? (
              <div className="grid gap-4">
                {form.links.map((link, index) => (
                  <div key={link.id} className="grid gap-2 rounded-card bg-hm-champagne/35 p-3">
                    <Field label="Label" value={link.label} onChange={(value) => updateLink(index, "label", value)} />
                    <Field label="URL" value={link.url} onChange={(value) => updateLink(index, "url", value)} />
                  </div>
                ))}
                <button className="rounded-xl bg-hm-champagne px-4 py-3 text-sm font-bold text-hm-ink disabled:opacity-50" type="button" disabled={form.links.length >= 5} onClick={() => update("links", [...form.links, { id: `new-${Date.now()}`, label: "", url: "", sortOrder: form.links.length }])}>Link hinzufuegen</button>
                <SaveButton status={status} onClick={() => saveProfile({ links: cleanLinks })} />
              </div>
            ) : null}

            {activeSheet === "banner" ? (
              <div className="grid gap-4">
                <Field label="Cover-Bild URL" value={form.coverImageUrl} onChange={(value) => update("coverImageUrl", value)} />
                <Field label="Profilmusik-Link" value={form.profileMusicUrl} onChange={(value) => update("profileMusicUrl", value)} />
                <Field label="Songtitel" value={form.profileMusicTitle} onChange={(value) => update("profileMusicTitle", value)} />
                <Field label="Artist" value={form.profileMusicArtist} onChange={(value) => update("profileMusicArtist", value)} />
                <SaveButton status={status} onClick={() => saveProfile({ coverImageUrl: form.coverImageUrl || null, profileMusicUrl: form.profileMusicUrl || null, profileMusicTitle: form.profileMusicTitle || null, profileMusicArtist: form.profileMusicArtist || null })} />
              </div>
            ) : null}

            {activeSheet === "grid" ? (
              <div className="grid gap-3">
                {!gridPosts.length ? <Hint text="Du brauchst zuerst Beitraege, bevor du dein Raster neu anordnen kannst." /> : null}
                {gridPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center gap-3 rounded-card bg-hm-champagne/35 p-3">
                    <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-[8px] bg-hm-champagne text-xs text-hm-inkSoft">
                      {post.mediaUrl ? <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" /> : "Post"}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-hm-ink">{post.content || "HotMess Beitrag"}</p>
                    <button className="rounded-pill bg-hm-porcelain px-3 py-1 text-xs font-bold" type="button" onClick={() => movePost(index, -1)}>Hoch</button>
                    <button className="rounded-pill bg-hm-porcelain px-3 py-1 text-xs font-bold" type="button" onClick={() => movePost(index, 1)}>Runter</button>
                  </div>
                ))}
                <SaveButton disabled={!gridPosts.length} status={status} onClick={saveGrid} />
              </div>
            ) : null}

            {activeSheet === "gender" ? (
              <div className="grid gap-3">
                {genderBlockedUntil ? <Hint text={`Du kannst dein Geschlecht alle 90 Tage aendern. Naechste Aenderung ab ${genderBlockedUntil}.`} /> : null}
                <Hint text="Beeinflusst die Event-Zuteilung (50/50)." />
                {Object.entries(genderLabels).map(([value, label]) => (
                  <button key={value} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${form.gender === value ? "border-hm-ink bg-hm-ink text-white" : "border-hm-border bg-hm-ivory text-hm-ink"}`} type="button" onClick={() => update("gender", value as typeof form.gender)}>
                    {label}
                  </button>
                ))}
                <SaveButton disabled={Boolean(genderBlockedUntil)} status={status} onClick={() => saveProfile({ gender: form.gender })} />
              </div>
            ) : null}
          </EditSheet>
        ) : null}
      </AnimatePresence>
    </main>
  );

  function updateLink(index: number, key: "label" | "url", value: string) {
    update("links", form.links.map((link, linkIndex) => linkIndex === index ? { ...link, [key]: value } : link));
  }
}

function sheetTitle(sheet: Exclude<SheetName, null>) {
  return {
    avatar: "Bild bearbeiten",
    name: "Name",
    username: "Benutzername",
    pronouns: "Pronomen",
    bio: "Bio",
    links: "Links",
    banner: "Banner",
    grid: "Raster neu anordnen",
    gender: "Geschlecht",
  }[sheet];
}

function AvatarCircle({ imageUrl, label }: { imageUrl: string; label: string }) {
  const fallback = label.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HM";
  return (
    <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-hm-gold/30 bg-hm-champagne text-xl font-bold text-hm-ink shadow-soft">
      {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : fallback}
    </div>
  );
}

function EditRow({ label, value, onClick, muted, badge }: { label: string; value: string; onClick: () => void; muted?: boolean; badge?: boolean }) {
  return (
    <button className="flex min-h-14 w-full items-center gap-4 border-b border-hm-gold/10 px-4 py-3 text-left last:border-b-0" type="button" onClick={onClick}>
      <span className="w-32 shrink-0 text-sm text-hm-inkSoft">{label}</span>
      <span className={`min-w-0 flex-1 truncate text-sm ${muted ? "text-hm-inkSoft" : "text-hm-ink"}`}>{value}</span>
      {badge ? <span className="rounded-pill bg-hm-gold px-2 py-0.5 text-[10px] font-bold text-white">Neu</span> : null}
      <ChevronRight className="h-4 w-4 text-hm-inkSoft" />
    </button>
  );
}

function EditSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-hm-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-hm-porcelain p-5 shadow-luxury" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-hm-ink">{title}</h2>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne" type="button" onClick={onClose} aria-label="Schliessen">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-hm-ink">
      {label}
      <input className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 font-normal outline-none focus:border-hm-gold" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Hint({ text }: { text: string }) {
  return <p className="rounded-card bg-hm-champagne/45 px-4 py-3 text-sm leading-6 text-hm-inkSoft">{text}</p>;
}

function SaveButton({ status, disabled, onClick }: { status: SaveStatus; disabled?: boolean; onClick: () => void }) {
  return (
    <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-hm-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-hm-gold disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={disabled || status === "saving"} onClick={onClick}>
      {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Speichern
    </button>
  );
}
