"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";
const accent = "text-hm-business";
const accentBg = "bg-hm-business text-white";

const suggestions = [
  {
    name: "Marko",
    headline: "Founder @ Balkan Commerce",
    company: "Balkan Commerce",
    position: "Gründer",
    industry: "Tech",
    lookingFor: ["Investment", "Partnerschaft"],
    offering: ["E-Commerce", "Produkt"],
    event: "HotMess Innsbruck",
  },
  {
    name: "Ana",
    headline: "Marketing Lead · Hospitality",
    company: "Adria Hospitality",
    position: "Marketing Lead",
    industry: "Hospitality",
    lookingFor: ["Kunden", "Networking"],
    offering: ["Marketing", "Events"],
    event: "HotMess Wien",
  },
];

const jobs = [
  {
    id: "event-host-innsbruck",
    title: "Event Host für HotMess Innsbruck",
    company: "HotMess",
    category: "Event",
    type: "Gig",
    city: "Innsbruck",
    salary: "€18 / Stunde",
    eventJob: true,
  },
  {
    id: "social-media-gastro",
    title: "Social Media Manager Gastro",
    company: "Adria Lounge",
    category: "Marketing",
    type: "Freelance",
    city: "Wien",
    salary: "Projektbasis",
    eventJob: false,
  },
  {
    id: "dj-support",
    title: "DJ Support & Stage Runner",
    company: "HotMess",
    category: "DJ/Musik",
    type: "Teilzeit",
    city: "München",
    salary: "nach Vereinbarung",
    eventJob: true,
  },
];

export function EventNetworkingBanner() {
  return (
    <section className={`${card} border-hm-business/30 p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Event-Networking</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">23 Professionals sind auch bei HotMess Innsbruck</h2>
      <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
        Entdecke Business-Kontakte mit echtem Event-Kontext. Kein kaltes Networking, sondern Menschen, die du vor Ort treffen kannst.
      </p>
      <Link className={`mt-5 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/business?filter=event">
        Kontakte beim Event entdecken
      </Link>
    </section>
  );
}

export function BusinessCardQR() {
  return (
    <div className={`${soft} p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Digitale Visitenkarte</p>
      <div className="mt-4 grid aspect-square max-w-40 place-items-center rounded-card border border-hm-border bg-hm-porcelain text-xs font-semibold uppercase tracking-luxury text-hm-inkSoft">
        QR
      </div>
      <p className="mt-4 text-sm leading-6 text-hm-inkSoft">Am Event scannen, Profil ansehen und mit einem Tipp vernetzen.</p>
    </div>
  );
}

export function BusinessCard({ index = 0 }: { index?: number }) {
  const profile = suggestions[index % suggestions.length];
  return (
    <article className={`${card} overflow-hidden`}>
      <div className="relative aspect-[5/3] bg-[radial-gradient(circle_at_25%_20%,rgba(168,133,63,.22),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]">
        <div className="absolute left-5 top-5 rounded-pill border border-hm-business/40 bg-hm-porcelain px-4 py-2 text-xs font-semibold uppercase tracking-luxury text-hm-business">
          Auch bei {profile.event}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h1 className="hm-display text-4xl text-hm-ink">{profile.name}</h1>
          <p className="mt-1 text-sm font-semibold text-hm-ink">{profile.headline}</p>
          <p className="mt-1 text-sm text-hm-inkSoft">
            {profile.company} · {profile.position} · {profile.industry}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TagGroup title="Sucht" tags={profile.lookingFor} />
          <TagGroup title="Bietet" tags={profile.offering} />
        </div>
      </div>
    </article>
  );
}

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-inkSoft">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span className="rounded-pill border border-hm-borderSoft px-3 py-1 text-xs text-hm-inkSoft" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ConnectActions() {
  return (
    <div className="flex items-center justify-center gap-3">
      {["Überspringen", "Interesse", "Priority"].map((label) => (
        <button
          className={`rounded-pill px-5 py-3 text-sm font-semibold ${
            label === "Interesse" ? accentBg : "border border-hm-business/40 text-hm-ink"
          }`}
          key={label}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function PriorityButton() {
  return (
    <button className="rounded-pill border border-hm-business px-4 py-2 text-sm font-semibold text-hm-business" type="button">
      Priority-Interesse
    </button>
  );
}

export function SuggestionStack() {
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-xl space-y-5">
      <BusinessCard index={active} />
      <ConnectActions />
      <div className="flex justify-center">
        <button className="rounded-pill border border-hm-border px-4 py-2 text-sm text-hm-ink" onClick={() => setActive((value) => value + 1)} type="button">
          Nächster Vorschlag
        </button>
      </div>
    </section>
  );
}

export function MatchModal() {
  return (
    <div className={`${soft} p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business Match</p>
      <p className="mt-2 font-semibold text-hm-ink">Ihr sucht beide nach Partnerschaften im Event- und Hospitality-Bereich.</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Der normale HotMess-Chat wird geöffnet. Business bleibt getrennt vom privaten Feed.</p>
      <Link className={`mt-4 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/chat/business-demo">
        Nachricht senden
      </Link>
    </div>
  );
}

export function ConnectionList() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Verbindungen</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Business-Kontakte mit Kontext</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <MatchModal />
        <BusinessCardQR />
      </div>
    </section>
  );
}

export function CoffeeChatProposer() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Coffee-Chat</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Treffen vorschlagen</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
        <div className={`${soft} p-5`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Vor Ort", "Video"].map((mode) => (
              <button className="rounded-pill border border-hm-business/40 px-4 py-3 text-sm font-semibold text-hm-ink" key={mode} type="button">
                {mode}
              </button>
            ))}
          </div>
          <TimeSlotPicker />
          <input className="mt-4 w-full rounded-card border border-hm-border bg-hm-porcelain px-4 py-3 text-sm outline-none focus:border-hm-business" placeholder="Ort oder Video-Link" />
        </div>
        <CalendarExport />
      </div>
    </section>
  );
}

export function TimeSlotPicker() {
  return (
    <div className="mt-4 grid gap-2">
      {["Morgen, 18:00", "Freitag, 11:30", "Beim Event, 21:00"].map((slot) => (
        <button className="rounded-pill border border-hm-border px-4 py-2 text-left text-sm text-hm-inkSoft" key={slot} type="button">
          {slot}
        </button>
      ))}
    </div>
  );
}

export function CoffeeChatList() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Geplante Coffee-Chats</p>
      <div className="mt-4 space-y-3">
        {["Ana · Video · bestätigt", "Marko · HotMess Innsbruck · vorgeschlagen"].map((item) => (
          <div className={`${soft} p-4 text-sm text-hm-inkSoft`} key={item}>{item}</div>
        ))}
      </div>
    </section>
  );
}

export function CalendarExport() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Kalender</p>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Business Plus bereitet .ics und Google Calendar Export vor.</p>
      <button className={`mt-4 rounded-pill px-4 py-2 text-sm font-semibold ${accentBg}`} type="button">Export vorbereiten</button>
    </div>
  );
}

export function JobFilters() {
  return (
    <div className={`${card} grid gap-3 p-4 md:grid-cols-4`}>
      {["Kategorie", "Typ", "Stadt", "Remote"].map((filter) => (
        <button className="rounded-pill border border-hm-border px-4 py-3 text-left text-sm text-hm-inkSoft" key={filter} type="button">
          {filter}
        </button>
      ))}
    </div>
  );
}

export function JobCard({ job = jobs[0] }: { job?: (typeof jobs)[number] }) {
  return (
    <article className={`${soft} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-hm-ink">{job.title}</h2>
          <p className="mt-1 text-sm text-hm-inkSoft">{job.company} · {job.type} · {job.city}</p>
        </div>
        {job.eventJob ? (
          <span className="rounded-pill border border-hm-business/40 px-3 py-1 text-xs font-semibold text-hm-business">Event-Job</span>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-hm-inkSoft">{job.category} · {job.salary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className={`rounded-pill px-4 py-2 text-sm font-semibold ${accentBg}`} href={`/business/jobs/${job.id}`}>
          Details
        </Link>
        <button className="rounded-pill border border-hm-border px-4 py-2 text-sm text-hm-ink" type="button">Speichern</button>
      </div>
    </article>
  );
}

export function JobBoard() {
  return (
    <section className="space-y-5">
      <JobFilters />
      <div className="grid gap-4 lg:grid-cols-3">
        {jobs.map((job) => <JobCard job={job} key={job.id} />)}
      </div>
    </section>
  );
}

export function ApplyButton() {
  return (
    <button className={`rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} type="button">
      Jetzt bewerben
    </button>
  );
}

export function SaveJobButton() {
  return (
    <button className="rounded-pill border border-hm-business/40 px-5 py-3 text-sm font-semibold text-hm-ink" type="button">
      Job speichern
    </button>
  );
}

export function JobDetail() {
  const job = jobs[0];
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Job-Detail</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">{job.title}</h1>
      <p className="mt-3 text-sm text-hm-inkSoft">{job.company} · {job.type} · {job.city} · {job.salary}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
        <div className={`${soft} p-5 text-sm leading-7 text-hm-inkSoft`}>
          Beschreibung, Anforderungen und Event-Bezug werden hier strukturiert angezeigt. Die Bewerbung öffnet einen HotMess-Chat mit Anschreiben und optionalem CV.
        </div>
        <div className={`${soft} space-y-3 p-5`}>
          <ApplyButton />
          <SaveJobButton />
        </div>
      </div>
    </section>
  );
}

export function JobEditor() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Jobs verwalten</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Inserat erstellen</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {["Titel", "Firma", "Kategorie", "Typ", "Stadt", "Gehalt optional"].map((field) => (
          <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm outline-none focus:border-hm-business" key={field} placeholder={field} />
        ))}
      </div>
      <textarea className="mt-4 min-h-36 w-full rounded-card border border-hm-border bg-hm-ivory p-4 text-sm outline-none focus:border-hm-business" placeholder="Beschreibung und Anforderungen" />
    </section>
  );
}

export function ApplicationManager() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Bewerbungen</p>
      <div className="mt-4 space-y-3">
        {["applied", "viewed", "shortlisted", "hired"].map((status) => (
          <div className={`${soft} flex items-center justify-between p-4 text-sm`} key={status}>
            <span className="text-hm-ink">Bewerberstatus</span>
            <span className="rounded-pill border border-hm-border px-3 py-1 text-xs text-hm-inkSoft">{status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GroupList() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Branchen-Gruppen</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {["Gastro DACH", "DJs Österreich", "Event-Tech Balkan"].map((group) => (
          <div className={`${soft} p-5`} key={group}>
            <h2 className="text-lg font-semibold text-hm-ink">{group}</h2>
            <p className="mt-2 text-sm text-hm-inkSoft">Gruppe mit Chat, Jobs und Event-Ankündigungen.</p>
            <button className={`mt-4 rounded-pill px-4 py-2 text-sm font-semibold ${accentBg}`} type="button">Beitreten</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GroupDetail() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Gruppen-Chat</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Business-Gruppen verwenden den normalen HotMess-Gruppenchat.</p>
    </div>
  );
}

export function CreateGroup() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Gruppe erstellen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nur Business Plus: Name, Branche, Stadt, privat oder öffentlich.</p>
      <button className={`mt-4 rounded-pill px-4 py-2 text-sm font-semibold ${accentBg}`} type="button">Plus-Gate prüfen</button>
    </div>
  );
}

export function BusinessProfileEditor() {
  const goals = ["Mitarbeiter", "Job", "Co-Founder", "Investment", "Mentoring", "Kunden", "Partnerschaft", "Networking"];
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business-Profil</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Berufsstatus ist Pflicht</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {["Berufsstatus", "Headline", "Firma", "Position", "Branche", "Jahre Erfahrung"].map((field) => (
          <input className="rounded-card border border-hm-border bg-hm-ivory px-4 py-3 text-sm outline-none focus:border-hm-business" key={field} placeholder={field} />
        ))}
      </div>
      <textarea className="mt-4 min-h-32 w-full rounded-card border border-hm-border bg-hm-ivory p-4 text-sm outline-none focus:border-hm-business" placeholder="Bio bis 600 Zeichen" />
      <div className="mt-5 flex flex-wrap gap-2">
        {goals.map((goal) => (
          <button className="rounded-pill border border-hm-business/40 px-4 py-2 text-sm text-hm-ink" key={goal} type="button">{goal}</button>
        ))}
      </div>
    </section>
  );
}

export function BusinessPlusUpsell() {
  const features = ["Unbegrenzte Vorschläge", "Priority-Interesse", "Wer hat mein Profil gesehen", "Jobs ausschreiben", "Gruppen erstellen", "Coffee-Chat Kalender"];
  const prices = useMemo(() => ["1 Monat €14,99", "12 Monate €119,99", "Einzel-Inserat €19,99", "Hervorheben +€9,99"], []);
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business Plus</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Für ernsthaftes Networking</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className={`${soft} p-5`}>
          <p className="font-semibold text-hm-ink">Plus-Funktionen</p>
          <div className="mt-4 grid gap-2">
            {features.map((feature) => <span className="text-sm text-hm-inkSoft" key={feature}>{feature}</span>)}
          </div>
        </div>
        <div className={`${soft} p-5`}>
          <p className="font-semibold text-hm-ink">Preise</p>
          <div className="mt-4 grid gap-2">
            {prices.map((price) => <button className="rounded-pill border border-hm-business/40 px-4 py-2 text-sm text-hm-ink" key={price} type="button">{price}</button>)}
          </div>
        </div>
      </div>
    </section>
  );
}
