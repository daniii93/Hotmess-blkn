import Link from "next/link";
import type { BusinessCandidate, BusinessMatch, BusinessMe, JobListing } from "@/features/business/live-service";
import { ApplyJobForm, BusinessConnectButtons, BusinessProfileForm } from "./business-actions";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";
const accent = "text-hm-business";
const accentBg = "bg-hm-business text-white";

export function BusinessGate({ me }: { me: BusinessMe | null }) {
  if (!me) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business Opt-in</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Bitte zuerst einloggen</h1>
        <Link className={`mt-5 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/login?returnTo=/business/profile">Einloggen</Link>
      </section>
    );
  }
  if (!me.verified) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Verifikation erforderlich</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Business nur fuer verifizierte Mitglieder</h1>
        <Link className={`mt-5 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/verify">Jetzt verifizieren</Link>
      </section>
    );
  }
  if (!me.businessEnabled || !me.profile) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business aktivieren</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Profil mit klaren Zielen anlegen</h1>
        <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Business ist getrennt von Dating und privatem Feed.</p>
        <Link className={`mt-5 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/business/profile">Profil anlegen</Link>
      </section>
    );
  }
  return null;
}

export function EventNetworkingBanner({ suggestions }: { suggestions: BusinessCandidate[] }) {
  const eventCount = suggestions.filter((item) => item.sharedEvent).length;
  return (
    <section className={`${card} border-hm-business/30 p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Event-Networking</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{eventCount ? `${eventCount} Professionals mit Event-Kontext` : "Business-Kontakte entdecken"}</h2>
      <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Kein kaltes Networking: HotMess zeigt Menschen, die du auch beim Event treffen kannst.</p>
      <Link className={`mt-5 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href="/business?filter=event">Kontakte beim Event entdecken</Link>
    </section>
  );
}

export function BusinessCardQR({ userId }: { userId?: string }) {
  return (
    <div className={`${soft} p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Digitale Visitenkarte</p>
      <div className="mt-4 grid aspect-square max-w-40 place-items-center rounded-card border border-hm-border bg-hm-porcelain text-xs font-semibold uppercase tracking-luxury text-hm-inkSoft">
        QR
      </div>
      <p className="mt-4 text-sm leading-6 text-hm-inkSoft">Business-ID: {userId ?? "noch nicht aktiv"}</p>
    </div>
  );
}

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-inkSoft">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.length ? tags.map((tag) => <span className="rounded-pill border border-hm-borderSoft px-3 py-1 text-xs text-hm-inkSoft" key={tag}>{tag}</span>) : <span className="text-xs text-hm-inkSoft">Keine Angabe</span>}
      </div>
    </div>
  );
}

export function BusinessCard({ profile }: { profile: BusinessCandidate }) {
  return (
    <article className={`${card} overflow-hidden`}>
      <div className="relative aspect-[5/3] bg-[radial-gradient(circle_at_25%_20%,rgba(168,133,63,.22),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        {profile.sharedEvent ? (
          <div className="absolute left-5 top-5 rounded-pill border border-hm-business/40 bg-hm-porcelain px-4 py-2 text-xs font-semibold uppercase tracking-luxury text-hm-business">
            Auch bei {profile.sharedEvent.title}
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h1 className="hm-display text-4xl text-hm-ink">{profile.name}</h1>
          <p className="mt-1 text-sm font-semibold text-hm-ink">{profile.headline}</p>
          <p className="mt-1 text-sm text-hm-inkSoft">{profile.company ?? "Selbststaendig"} · {profile.position ?? "Professional"} · {profile.industry ?? "Business"}</p>
        </div>
        <p className="rounded-card bg-hm-champagne/50 px-4 py-3 text-sm text-hm-ink">{profile.matchReason}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TagGroup title="Sucht" tags={profile.lookingFor} />
          <TagGroup title="Bietet" tags={profile.offering} />
        </div>
      </div>
    </article>
  );
}

export function SuggestionStack({ suggestions }: { suggestions: BusinessCandidate[] }) {
  const [first] = suggestions;
  if (!first) {
    return (
      <section className={`${card} mx-auto max-w-xl p-6 text-center`}>
        <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Keine Vorschlaege</p>
        <h2 className="hm-display mt-3 text-3xl text-hm-ink">Aktuell ist der Stapel leer</h2>
        <p className="mt-3 text-sm text-hm-inkSoft">Passe dein Business-Profil an oder pruefe spaeter neue Kontakte.</p>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-xl space-y-5">
      <BusinessCard profile={first} />
      <BusinessConnectButtons candidateId={first.userId} eventId={first.sharedEvent?.id} />
    </section>
  );
}

export function MatchModal({ match }: { match: BusinessMatch }) {
  return (
    <div className={`${soft} p-5`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business Match</p>
      <p className="mt-2 font-semibold text-hm-ink">{match.person.name}</p>
      <p className="mt-2 text-sm text-hm-inkSoft">{match.matchReason ?? match.person.matchReason}</p>
      {match.conversationId ? <Link className={`mt-4 inline-flex rounded-pill px-5 py-3 text-sm font-semibold ${accentBg}`} href={`/chat/${match.conversationId}`}>Nachricht senden</Link> : null}
    </div>
  );
}

export function ConnectionList({ matches }: { matches: BusinessMatch[] }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Verbindungen</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Business-Kontakte mit Kontext</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {matches.length ? matches.map((match) => <MatchModal match={match} key={match.id} />) : <p className="text-sm text-hm-inkSoft">Noch keine Verbindungen.</p>}
        <BusinessCardQR />
      </div>
    </section>
  );
}

export function JobFilters() {
  return (
    <div className={`${card} grid gap-3 p-4 md:grid-cols-4`}>
      {["Kategorie", "Typ", "Stadt", "Remote"].map((filter) => <button className="rounded-pill border border-hm-border px-4 py-3 text-left text-sm text-hm-inkSoft" key={filter} type="button">{filter}</button>)}
    </div>
  );
}

const formatSalary = (job: JobListing) => {
  if (!job.salaryMinCents && !job.salaryMaxCents) return "Gehalt offen";
  const fmt = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return `${job.salaryMinCents ? fmt.format(job.salaryMinCents / 100) : ""}${job.salaryMaxCents ? ` - ${fmt.format(job.salaryMaxCents / 100)}` : ""}${job.salaryPeriod ? ` / ${job.salaryPeriod}` : ""}`;
};

export function JobCard({ job }: { job: JobListing }) {
  return (
    <article className={`${soft} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-hm-ink">{job.title}</h2>
          <p className="mt-1 text-sm text-hm-inkSoft">{job.company} · {job.employmentType} · {job.city ?? "Remote"}</p>
        </div>
        {job.eventId ? <span className="rounded-pill border border-hm-business/40 px-3 py-1 text-xs font-semibold text-hm-business">Event-Job</span> : null}
      </div>
      <p className="mt-4 text-sm text-hm-inkSoft">{job.category} · {formatSalary(job)}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className={`rounded-pill px-4 py-2 text-sm font-semibold ${accentBg}`} href={`/business/jobs/${job.id}`}>Details</Link>
        <button className="rounded-pill border border-hm-border px-4 py-2 text-sm text-hm-ink" type="button">Speichern</button>
      </div>
    </article>
  );
}

export function JobBoard({ jobs }: { jobs: JobListing[] }) {
  return (
    <section className="space-y-5">
      <JobFilters />
      <div className="grid gap-4 lg:grid-cols-3">
        {jobs.length ? jobs.map((job) => <JobCard job={job} key={job.id} />) : <p className="text-sm text-hm-inkSoft">Noch keine offenen Jobs.</p>}
      </div>
    </section>
  );
}

export function JobDetail({ job }: { job: JobListing | null }) {
  if (!job) {
    return <section className={`${card} p-5 sm:p-8`}><h1 className="hm-display text-4xl text-hm-ink">Job nicht gefunden</h1></section>;
  }
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Job-Detail</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">{job.title}</h1>
      <p className="mt-3 text-sm text-hm-inkSoft">{job.company} · {job.employmentType} · {job.city ?? "Remote"} · {formatSalary(job)}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
        <div className={`${soft} p-5 text-sm leading-7 text-hm-inkSoft`}>
          <p>{job.description}</p>
          {job.requirements ? <p className="mt-4 font-semibold text-hm-ink">{job.requirements}</p> : null}
        </div>
        <div className={`${soft} p-5`}>
          <ApplyJobForm jobId={job.id} />
        </div>
      </div>
    </section>
  );
}

export function BusinessProfileEditor({ me }: { me: BusinessMe | null }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business-Profil</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Berufsstatus ist Pflicht</h1>
      <p className="mt-3 text-sm text-hm-inkSoft">Business ist getrennt vom privaten Profil und von Dating.</p>
      <div className="mt-6">
        <BusinessProfileForm defaults={me?.profile} />
      </div>
    </section>
  );
}

export function CoffeeChatProposer() {
  return <section className={`${card} p-5 sm:p-8`}><p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Coffee-Chat</p><h1 className="hm-display mt-3 text-4xl text-hm-ink">Treffen vorschlagen</h1><p className="mt-3 text-sm text-hm-inkSoft">Coffee-Chats werden aus Business-Matches heraus geplant.</p></section>;
}

export function CoffeeChatList() {
  return <section className={`${card} p-5`}><p className="font-semibold text-hm-ink">Geplante Coffee-Chats</p><p className="mt-2 text-sm text-hm-inkSoft">Noch keine Termine.</p></section>;
}

export function CalendarExport() {
  return <div className={`${soft} p-5`}><p className="font-semibold text-hm-ink">Kalender</p><p className="mt-2 text-sm text-hm-inkSoft">Business Plus bereitet Kalender-Export vor.</p></div>;
}

export function JobEditor() {
  return <section className={`${card} p-5 sm:p-8`}><p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Jobs verwalten</p><h1 className="hm-display mt-3 text-4xl text-hm-ink">Inserat erstellen</h1><p className="mt-3 text-sm text-hm-inkSoft">Posting-Gate fuer Business Plus ist vorbereitet.</p></section>;
}

export function ApplicationManager() {
  return <section className={`${card} p-5`}><p className="font-semibold text-hm-ink">Bewerbungen</p><p className="mt-2 text-sm text-hm-inkSoft">Bewerbungen laufen ueber den HotMess-Chat.</p></section>;
}

export function GroupList() {
  return <section className={`${card} p-5 sm:p-8`}><p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Branchen-Gruppen</p><p className="mt-3 text-sm text-hm-inkSoft">Gruppen-Chat und Plus-Gate bleiben vorbereitet.</p></section>;
}

export function GroupDetail() {
  return <div className={`${soft} p-5`}><p className="font-semibold text-hm-ink">Gruppen-Chat</p><p className="mt-2 text-sm text-hm-inkSoft">Nutzt den normalen HotMess-Gruppenchat.</p></div>;
}

export function CreateGroup() {
  return <div className={`${soft} p-5`}><p className="font-semibold text-hm-ink">Gruppe erstellen</p><p className="mt-2 text-sm text-hm-inkSoft">Nur Business Plus.</p></div>;
}

export function BusinessPlusUpsell() {
  const features = ["Unbegrenzte Vorschlaege", "Priority-Interesse", "Wer hat mein Profil gesehen", "Jobs ausschreiben", "Gruppen erstellen", "Coffee-Chat Kalender"];
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className={`text-xs font-semibold uppercase tracking-luxury ${accent}`}>Business Plus</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Fuer ernsthaftes Networking</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => <div className={`${soft} p-4 text-sm font-semibold text-hm-ink`} key={feature}>{feature}</div>)}
      </div>
    </section>
  );
}

