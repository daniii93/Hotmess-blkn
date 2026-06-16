"use client";

import { motion } from "framer-motion";
import { Grid3X3, PlaySquare, RefreshCcw, UserRound } from "lucide-react";
import { useState } from "react";
import type { ProfilePost } from "@/features/profile/live-service";
import { PostGrid } from "./PostGrid";

type ProfileTabsProps = {
  posts: ProfilePost[];
  reels: ProfilePost[];
  shared: ProfilePost[];
  tagged: ProfilePost[];
  isOwnProfile: boolean;
  canViewContent: boolean;
};

const tabs = [
  { key: "posts", label: "Beitraege", icon: Grid3X3 },
  { key: "reels", label: "Reels", icon: PlaySquare },
  { key: "shared", label: "Geteiltes", icon: RefreshCcw },
  { key: "tagged", label: "Markierungen", icon: UserRound },
] as const;

export function ProfileTabs({ posts, reels, shared, tagged, isOwnProfile, canViewContent }: ProfileTabsProps) {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("posts");
  const content = active === "posts" ? posts : active === "reels" ? reels : active === "shared" ? shared : tagged;

  if (!canViewContent) {
    return (
      <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-8 text-center shadow-soft">
        <h2 className="text-lg font-bold text-hm-ink">Dieses Konto ist privat</h2>
        <p className="mt-2 text-sm text-hm-inkSoft">Folge diesem Profil, um Beitraege, Reels und Markierungen zu sehen.</p>
      </section>
    );
  }

  return (
    <section className="mt-5">
      <div className="grid grid-cols-4 border-y border-hm-gold/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.key;
          return (
            <button key={tab.key} className="relative flex min-h-12 items-center justify-center gap-2 py-3 text-xs font-bold text-hm-ink" type="button" onClick={() => setActive(tab.key)}>
              <Icon className={`h-4 w-4 ${selected ? "text-hm-ink" : "text-hm-inkSoft"}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              {selected ? <motion.span layoutId="profile-tab-underline" className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-hm-ink" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <PostGrid posts={content} emptyOwnProfile={isOwnProfile && active === "posts"} />
      </div>
    </section>
  );
}
