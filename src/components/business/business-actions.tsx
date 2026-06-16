"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BusinessConnectButtons({ candidateId, eventId }: { candidateId: string; eventId?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const connect = (direction: "skip" | "interested" | "priority") => {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/business/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swipedId: candidateId, direction, matchedViaEventId: eventId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Verbindung konnte nicht gespeichert werden.");
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
        <button className="rounded-pill border border-hm-business/40 px-5 py-3 text-sm font-semibold text-hm-ink" disabled={isPending} onClick={() => connect("skip")} type="button">Ueberspringen</button>
        <button className="rounded-pill bg-hm-business px-5 py-3 text-sm font-semibold text-white" disabled={isPending} onClick={() => connect("interested")} type="button">Interesse</button>
        <button className="rounded-pill border border-hm-business px-5 py-3 text-sm font-semibold text-hm-business" disabled={isPending} onClick={() => connect("priority")} type="button">Priority</button>
      </div>
      {error ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export function BusinessProfileForm({ defaults }: { defaults?: any }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const split = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

  const submit = (formData: FormData) => {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const response = await fetch("/api/business/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerStatus: String(formData.get("careerStatus") || "employed"),
          headline: String(formData.get("headline") || ""),
          company: String(formData.get("company") || ""),
          position: String(formData.get("position") || ""),
          industry: String(formData.get("industry") || ""),
          experienceYears: Number(formData.get("experienceYears") || 0),
          bio: String(formData.get("bio") || ""),
          skills: split(formData.get("skills")),
          languages: split(formData.get("languages")),
          websiteUrl: String(formData.get("websiteUrl") || ""),
          linkedinUrl: String(formData.get("linkedinUrl") || ""),
          lookingFor: split(formData.get("lookingFor")),
          offering: split(formData.get("offering")),
          openToWork: formData.get("openToWork") === "on",
          openToHire: formData.get("openToHire") === "on",
          isActive: formData.get("isActive") === "on",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Business-Profil konnte nicht gespeichert werden.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form action={submit} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <select className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="careerStatus" defaultValue={defaults?.career_status ?? "employed"}>
          <option value="employed">Angestellt</option>
          <option value="self_employed">Selbststaendig</option>
          <option value="founder">Gruender</option>
          <option value="freelancer">Freelancer</option>
          <option value="student">Student</option>
          <option value="job_seeking">Jobsuchend</option>
          <option value="investor">Investor</option>
          <option value="executive">Fuehrungskraft</option>
        </select>
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="headline" placeholder="Headline" defaultValue={defaults?.headline ?? ""} required />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="company" placeholder="Firma" defaultValue={defaults?.company ?? ""} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="position" placeholder="Position" defaultValue={defaults?.position ?? ""} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="industry" placeholder="Branche" defaultValue={defaults?.industry ?? ""} required />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="experienceYears" type="number" min={0} max={60} placeholder="Jahre Erfahrung" defaultValue={defaults?.experience_years ?? 0} />
      </div>
      <textarea className="min-h-32 rounded-card border border-hm-border bg-hm-ivory p-4 text-sm" name="bio" placeholder="Bio bis 600 Zeichen" defaultValue={defaults?.bio ?? ""} />
      <div className="grid gap-4 lg:grid-cols-2">
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="lookingFor" placeholder="Ich suche, mit Komma" defaultValue={(defaults?.looking_for_tags ?? []).join(", ")} required />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="offering" placeholder="Ich biete, mit Komma" defaultValue={(defaults?.offering_tags ?? []).join(", ")} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="skills" placeholder="Skills, mit Komma" defaultValue={(defaults?.skills ?? []).join(", ")} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="languages" placeholder="Sprachen, mit Komma" defaultValue={(defaults?.languages ?? []).join(", ")} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="websiteUrl" placeholder="Website URL" defaultValue={defaults?.website_url ?? ""} />
        <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="linkedinUrl" placeholder="LinkedIn URL" defaultValue={defaults?.linkedin_url ?? ""} />
      </div>
      <div className="grid gap-3 text-sm text-hm-inkSoft sm:grid-cols-3">
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4"><input name="openToWork" type="checkbox" defaultChecked={defaults?.open_to_work ?? false} className="accent-hm-business" /> Open to work</label>
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4"><input name="openToHire" type="checkbox" defaultChecked={defaults?.open_to_hire ?? false} className="accent-hm-business" /> Open to hire</label>
        <label className="inline-flex items-center gap-2 rounded-card border border-hm-borderSoft bg-hm-ivory p-4"><input name="isActive" type="checkbox" defaultChecked={defaults?.is_active ?? true} className="accent-hm-business" /> Sichtbar</label>
      </div>
      {error ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {saved ? <p className="rounded-card bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Business-Profil gespeichert.</p> : null}
      <button className="rounded-pill bg-hm-business px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending} type="submit">Business-Profil speichern</button>
    </form>
  );
}

export function ApplyJobForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/business/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverMessage: String(formData.get("coverMessage") || ""), cvUrl: String(formData.get("cvUrl") || "") }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Bewerbung konnte nicht gesendet werden.");
        return;
      }
      if (payload.conversationId) router.push(`/chat/${payload.conversationId}`);
    });
  };

  return (
    <form action={submit} className="space-y-3">
      <textarea className="min-h-28 w-full rounded-card border border-hm-border bg-hm-ivory p-4 text-sm" name="coverMessage" placeholder="Kurzes Anschreiben" />
      <input className="w-full rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm" name="cvUrl" placeholder="CV URL optional" />
      {error ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button className="rounded-pill bg-hm-business px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending} type="submit">Jetzt bewerben</button>
    </form>
  );
}

