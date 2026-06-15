import Link from "next/link";
import type { DatingCandidate, DatingLike, DatingMatch, DatingMe } from "@/features/dating/live-service";
import { DatingProfileForm, SwipeActionButtons } from "./dating-actions";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";

export function DatingGate({ me }: { me: DatingMe | null }) {
  if (!me) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Dating Opt-in</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Bitte zuerst einloggen</h1>
        <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Dating ist ein getrennter, verifizierter Bereich innerhalb von HotMess.</p>
        <Link className="mt-5 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/login?returnTo=/dating/profile">
          Einloggen
        </Link>
      </section>
    );
  }

  if (!me.verified) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Verifikation erforderlich</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Dating nur fuer verifizierte Mitglieder</h1>
        <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Das schuetzt den Dating-Pool und haelt Profile serioes.</p>
        <Link className="mt-5 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/verify">
          Jetzt verifizieren
        </Link>
      </section>
    );
  }

  if (!me.datingEnabled || !me.datingProfile) {
    return (
      <section className={`${card} p-5 sm:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Dating aktivieren</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink">Dein Dating-Profil ist getrennt</h1>
        <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
          Es erscheint nicht im normalen Feed und ist nur fuer andere Dating-Mitglieder sichtbar.
        </p>
        <Link className="mt-5 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/dating/profile">
          Profil anlegen
        </Link>
      </section>
    );
  }

  return null;
}

export function EventFilterBanner({ candidates }: { candidates: DatingCandidate[] }) {
  const eventCount = candidates.filter((candidate) => candidate.sharedEvent).length;
  const title = eventCount > 0 ? `${eventCount} Dating-Mitglieder mit Event-Kontext` : "Event-Filter bereit";

  return (
    <section className={`${card} border-hm-dating/30 p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Event-Filter</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
        Entdecke Menschen, die zum selben Event gehen. Genau dieser Kontext ist der HotMess-USP.
      </p>
      <Link className="mt-5 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/dating?filter=event">
        Event-Matches entdecken
      </Link>
    </section>
  );
}

export function EventProfileBadge({ event }: { event: DatingCandidate["sharedEvent"] }) {
  if (!event) return null;
  return (
    <div className="rounded-pill border border-hm-dating/50 bg-hm-champagne px-4 py-2 text-xs font-semibold uppercase tracking-luxury text-hm-dating">
      Geht zu {event.title}
    </div>
  );
}

export function ProfileCard({ candidate }: { candidate: DatingCandidate }) {
  return (
    <article className={`${card} overflow-hidden`}>
      <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_30%_20%,rgba(156,74,60,.25),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]">
        {candidate.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute left-5 top-5">
          <EventProfileBadge event={candidate.sharedEvent} />
        </div>
        {candidate.superLikedMe ? (
          <div className="absolute right-5 top-5 rounded-pill bg-hm-dating px-4 py-2 text-xs font-semibold uppercase tracking-luxury text-white">
            SuperLike
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h1 className="hm-display text-4xl text-hm-ink">
            {candidate.displayName}
            {candidate.age ? `, ${candidate.age}` : ""}
          </h1>
          <p className="mt-1 text-sm text-hm-inkSoft">
            {candidate.verified ? "Verifiziert" : "Nicht verifiziert"} · {candidate.city ?? candidate.distanceLabel}
          </p>
        </div>
        <p className="text-sm leading-7 text-hm-ink">{candidate.bio || "Noch keine Bio hinterlegt."}</p>
        <div className="flex flex-wrap gap-2">
          {[candidate.relationshipGoal, ...candidate.languages, ...candidate.interests].filter(Boolean).slice(0, 8).map((tag) => (
            <span className="rounded-pill border border-hm-borderSoft px-3 py-1 text-xs text-hm-inkSoft" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function SwipeStack({ candidates }: { candidates: DatingCandidate[] }) {
  const [first] = candidates;
  if (!first) {
    return (
      <section className={`${card} mx-auto max-w-md p-6 text-center`}>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Keine Karten</p>
        <h2 className="hm-display mt-3 text-3xl text-hm-ink">Der Stapel ist leer</h2>
        <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Passe die Filter an oder pruefe spaeter neue Profile.</p>
        <Link className="mt-5 inline-flex rounded-pill border border-hm-dating px-5 py-3 text-sm font-semibold text-hm-dating" href="/dating/filters">
          Filter oeffnen
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md space-y-5">
      <ProfileCard candidate={first} />
      <SwipeActionButtons candidateId={first.userId} eventId={first.sharedEvent?.id} />
    </section>
  );
}

export function WhoLikesYou({ likes, tier }: { likes: DatingLike[]; tier: string }) {
  const canSee = tier === "gold" || tier === "platinum";

  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Wer mag dich</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">{likes.length} Menschen moegen dich</h1>
      <p className="mt-3 text-sm text-hm-inkSoft">
        Gold und Platinum zeigen klare Profile. Free und Plus sehen nur die Anzahl.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {likes.slice(0, 9).map((like) => (
          <div className={`${soft} overflow-hidden ${canSee ? "" : "blur-[2px]"}`} key={like.userId}>
            <div className="aspect-[3/4] bg-hm-champagne">
              {like.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={like.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-4">
              <p className="font-semibold text-hm-ink">{canSee ? like.displayName : "Gold freischalten"}</p>
              <p className="text-xs text-hm-inkSoft">{like.direction === "super" ? "SuperLike" : "Like"}</p>
            </div>
          </div>
        ))}
      </div>
      {!canSee ? (
        <Link className="mt-6 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/dating/premium">
          Gold ansehen
        </Link>
      ) : null}
    </section>
  );
}

export function MatchModal({ match }: { match: DatingMatch }) {
  return (
    <div className={`${soft} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Match</p>
      <p className="mt-2 font-semibold text-hm-ink">{match.person.displayName}</p>
      <p className="mt-2 text-sm text-hm-inkSoft">
        {match.matchedViaEvent ? `Ihr geht beide zu ${match.matchedViaEvent.title}.` : "HotMess Dating Match."}
      </p>
      {match.conversationId ? (
        <Link className="mt-4 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href={`/chat/${match.conversationId}`}>
          Nachricht senden
        </Link>
      ) : null}
    </div>
  );
}

export function RoomBookingPrompt() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Gemeinsam uebernachten?</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nur wenn beide zustimmen, wird der Hotel-Hinweis geteilt. Ablehnung bleibt diskret.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Ich bin dabei", "Nein", "Spaeter"].map((item) => (
          <button className="rounded-pill border border-hm-dating/40 px-4 py-2 text-sm text-hm-ink" key={item} type="button">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MatchList({ matches }: { matches: DatingMatch[] }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Matches</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {matches.length ? matches.map((match) => <MatchModal match={match} key={match.id} />) : <p className="text-sm text-hm-inkSoft">Noch keine Matches.</p>}
        <RoomBookingPrompt />
      </div>
    </section>
  );
}

export function DatingProfileEditor({ me }: { me: DatingMe | null }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Dating-Profil</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Getrennt vom Hauptprofil</h1>
      <p className="mt-3 text-sm leading-7 text-hm-inkSoft">Eigene Bio, eigene Filter und Sichtbarkeit nur im Dating-Modus.</p>
      <div className="mt-6">
        <DatingProfileForm defaults={me?.datingProfile} fallbackName={me?.baseName ?? "HotMess"} />
      </div>
    </section>
  );
}

export function DatingFilters({ me }: { me: DatingMe | null }) {
  const profile = me?.datingProfile;
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Filter</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          `Suche: ${(profile?.looking_for ?? ["everyone"]).join(", ")}`,
          `Alter ${profile?.pref_age_min ?? 18}-${profile?.pref_age_max ?? 99}`,
          `Distanz ${profile?.pref_distance_km ?? 50} km`,
          profile?.pref_only_event_attendees ? "Nur Event-Teilnehmer" : "Alle passenden Profile",
          profile?.pref_only_verified ? "Nur Verifizierte" : "Auch nicht verifizierte",
        ].map((filter) => (
          <div className={`${soft} p-4 font-semibold text-hm-ink`} key={filter}>
            {filter}
          </div>
        ))}
      </div>
      <Link className="mt-6 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/dating/profile">
        Filter bearbeiten
      </Link>
    </section>
  );
}

const tiers = [
  ["Plus", "Unbegrenzt swipen, Rewind, 5 SuperLikes/Tag, Passport, 1 Boost/Monat"],
  ["Gold", "Alles aus Plus, Wer mag dich, goldener Rahmen"],
  ["Platinum", "Priority Likes, First Impressions, SuperLike mit Notiz, Platin-Rahmen"],
];

export function PremiumTiers() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Premium</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {tiers.map(([tier, text]) => (
          <div className={`${soft} p-5`} key={tier}>
            <h2 className="hm-display text-3xl text-hm-ink">{tier}</h2>
            <p className="mt-3 text-sm leading-7 text-hm-inkSoft">{text}</p>
            <button className="mt-5 rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" type="button">
              {tier} waehlen
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ConsumableShop() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Einzelkaeufe</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Boost 1", "Boost 5", "SuperLike 5", "SuperLike 25"].map((item) => (
          <button className="rounded-pill border border-hm-dating/40 px-4 py-2 text-sm text-hm-ink" key={item} type="button">
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

