"use client";

import { useRef } from "react";
import type { ProfileViewModel } from "@/features/profile/live-service";
import { ProfileControlCenter } from "./ProfileControlCenter";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

export function ProfilePageClient({ model }: { model: ProfileViewModel }) {
  const tabsRef = useRef<HTMLDivElement>(null);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-3">
      <ProfileHeader model={model} onPostsClick={() => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />
      <ProfileControlCenter model={model} />
      <div ref={tabsRef}>
        <ProfileTabs
          posts={model.posts}
          reels={model.reels}
          shared={model.shared}
          tagged={model.tagged}
          isOwnProfile={model.isOwnProfile}
          canViewContent={model.canViewContent}
        />
      </div>
    </main>
  );
}
