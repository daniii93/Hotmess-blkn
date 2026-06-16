"use client";

import Link from "next/link";
import { ChevronDown, Lock, Menu, Plus, ShieldCheck } from "lucide-react";
import type { ProfileViewModel } from "@/features/profile/live-service";
import { ProfileActions } from "./ProfileActions";
import { ProfileMusicChip } from "./ProfileMusicChip";
import { ProfileNote } from "./ProfileNote";
import { ProfileStats } from "./ProfileStats";

type ProfileHeaderProps = {
  model: ProfileViewModel;
  onPostsClick: () => void;
};

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HM";

export function ProfileHeader({ model, onPostsClick }: ProfileHeaderProps) {
  const { profile } = model;
  const verified = profile.verificationStatus === "verified";

  return (
    <section>
      <div className="flex items-center justify-between px-1 py-2">
        <Link className="grid h-10 w-10 place-items-center rounded-full text-hm-ink" href="/create" aria-label="Erstellen">
          <Plus className="h-6 w-6" />
        </Link>
        <div className="flex items-center gap-1 text-sm font-bold text-hm-ink">
          {profile.isPrivate ? <Lock className="h-4 w-4" /> : null}
          <span>@{profile.username}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <Link className="grid h-10 w-10 place-items-center rounded-full text-hm-ink" href="/settings" aria-label="Einstellungen">
          <Menu className="h-6 w-6" />
        </Link>
      </div>

      {profile.coverImageUrl ? (
        <div className="mt-2 aspect-[4/1.35] overflow-hidden rounded-card bg-hm-champagne">
          <img src={profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : model.isOwnProfile ? (
        <Link className="mt-2 block rounded-card border border-dashed border-hm-gold/35 bg-hm-champagne/35 px-4 py-4 text-center text-sm font-bold text-hm-ink" href="/profile/edit">
          + Banner hinzufuegen
        </Link>
      ) : null}

      <div className="mt-6 grid grid-cols-[112px_1fr] gap-4">
        <div>
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-hm-gold via-hm-champagne to-hm-goldDeep p-[3px]">
            <ProfileNote isOwnProfile={model.isOwnProfile} />
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-full border-4 border-hm-ivory bg-hm-champagne text-xl font-bold text-hm-ink">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" /> : initials(profile.fullName)}
            </div>
            {model.isOwnProfile ? (
              <Link className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-hm-ivory bg-hm-ink text-white" href="/create" aria-label="Story hinzufuegen">
                <Plus className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-serif text-2xl font-semibold text-hm-ink">{profile.fullName}</h1>
            {verified ? <ShieldCheck className="h-5 w-5 text-hm-goldDeep" aria-label="Verifiziert" /> : null}
          </div>
          <ProfileStats
            posts={model.counts.posts}
            followers={model.counts.followers}
            following={model.counts.following}
            followersList={model.followers}
            followingList={model.following}
            onPostsClick={onPostsClick}
          />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold text-hm-ink">{profile.fullName}</p>
        {profile.bio ? <p className="mt-1 whitespace-pre-line text-sm leading-6 text-hm-inkSoft">{profile.bio}</p> : model.isOwnProfile ? <p className="mt-1 text-sm text-hm-inkSoft">Erzaehl deiner Szene, wer du bist.</p> : null}
        {profile.city ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-hm-inkSoft">{profile.city}{profile.country ? ` · ${profile.country}` : ""}</p> : null}
        <ProfileMusicChip title={profile.profileMusicTitle} artist={profile.profileMusicArtist} url={profile.profileMusicUrl} />
      </div>

      <ProfileActions profileId={profile.id} username={profile.username} isOwnProfile={model.isOwnProfile} relationship={model.relationship} />
    </section>
  );
}
