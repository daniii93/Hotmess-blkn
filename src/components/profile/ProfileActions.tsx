"use client";

import Link from "next/link";
import { MoreHorizontal, QrCode, UserPlus } from "lucide-react";
import { FollowButton } from "./FollowButton";

type ProfileActionsProps = {
  profileId: string;
  username: string;
  isOwnProfile: boolean;
  relationship: "none" | "requested" | "following" | "friends" | "blocked" | "blocked_by";
};

export function ProfileActions({ profileId, username, isOwnProfile, relationship }: ProfileActionsProps) {
  const shareProfile = async () => {
    const url = `${window.location.origin}/u/${username}`;
    if (navigator.share) {
      await navigator.share({ title: `@${username}`, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  if (isOwnProfile) {
    return (
      <div className="mt-4 grid grid-cols-[1fr_1fr_44px] gap-2">
        <Link className="rounded-xl bg-hm-champagne px-4 py-2.5 text-center text-sm font-bold text-hm-ink" href="/profile/edit">Bearbeiten</Link>
        <button className="rounded-xl bg-hm-champagne px-4 py-2.5 text-sm font-bold text-hm-ink" type="button" onClick={shareProfile}>Profil teilen</button>
        <Link className="grid h-11 place-items-center rounded-xl bg-hm-champagne text-hm-ink" href="/explore" aria-label="Personen entdecken">
          <UserPlus className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-[1fr_1fr_44px] gap-2">
      <FollowButton userId={profileId} initialState={relationship} />
      <Link className="rounded-xl bg-hm-champagne px-4 py-2.5 text-center text-sm font-bold text-hm-ink" href={`/chat?user=${profileId}`}>Nachricht</Link>
      <button className="grid h-11 place-items-center rounded-xl bg-hm-champagne text-hm-ink" type="button" onClick={shareProfile} aria-label="Profil teilen">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
