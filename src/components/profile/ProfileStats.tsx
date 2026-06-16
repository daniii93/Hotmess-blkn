"use client";

import { useState } from "react";
import type { ProfilePerson } from "@/features/profile/live-service";

type ProfileStatsProps = {
  posts: number;
  followers: number | null;
  following: number | null;
  followersList: ProfilePerson[];
  followingList: ProfilePerson[];
  onPostsClick: () => void;
};

function formatCount(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("de-DE", { notation: value > 9999 ? "compact" : "standard" }).format(value);
}

function PersonList({ title, people, onClose }: { title: string; people: ProfilePerson[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-hm-ink/35 p-3 sm:place-items-center">
      <section className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-card bg-hm-porcelain shadow-luxury">
        <div className="flex items-center justify-between border-b border-hm-border px-5 py-4">
          <h2 className="text-sm font-bold text-hm-ink">{title}</h2>
          <button className="text-sm text-hm-inkSoft" type="button" onClick={onClose}>Schliessen</button>
        </div>
        <div className="max-h-[64vh] overflow-y-auto p-3">
          {people.length ? people.map((person) => (
            <a key={person.id} className="flex items-center gap-3 rounded-card p-3 hover:bg-hm-champagne/40" href={`/u/${person.username}`}>
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-hm-champagne text-sm font-bold text-hm-ink">
                {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" /> : person.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-hm-ink">{person.name}</p>
                <p className="truncate text-xs text-hm-inkSoft">@{person.username}</p>
              </div>
              <span className="rounded-pill bg-hm-champagne px-3 py-1 text-xs font-semibold text-hm-ink">Ansehen</span>
            </a>
          )) : <p className="p-5 text-sm text-hm-inkSoft">Noch keine Eintraege sichtbar.</p>}
        </div>
      </section>
    </div>
  );
}

export function ProfileStats({ posts, followers, following, followersList, followingList, onPostsClick }: ProfileStatsProps) {
  const [modal, setModal] = useState<"followers" | "following" | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 rounded-card border border-hm-gold/15 bg-hm-porcelain/70 text-center">
        <button className="px-3 py-3" type="button" onClick={onPostsClick}>
          <span className="font-serif text-xl font-semibold text-hm-ink">{formatCount(posts)}</span>
          <span className="block text-[11px] font-semibold text-hm-inkSoft">Beitraege</span>
        </button>
        <button className="border-x border-hm-gold/15 px-3 py-3" type="button" onClick={() => followers !== null && setModal("followers")}>
          <span className="font-serif text-xl font-semibold text-hm-ink">{formatCount(followers)}</span>
          <span className="block text-[11px] font-semibold text-hm-inkSoft">Follower</span>
        </button>
        <button className="px-3 py-3" type="button" onClick={() => following !== null && setModal("following")}>
          <span className="font-serif text-xl font-semibold text-hm-ink">{formatCount(following)}</span>
          <span className="block text-[11px] font-semibold text-hm-inkSoft">Gefolgt</span>
        </button>
      </div>
      {modal === "followers" ? <PersonList title="Follower" people={followersList} onClose={() => setModal(null)} /> : null}
      {modal === "following" ? <PersonList title="Gefolgt" people={followingList} onClose={() => setModal(null)} /> : null}
    </>
  );
}
