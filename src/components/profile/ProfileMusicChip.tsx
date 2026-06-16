"use client";

import { Music, Play } from "lucide-react";

export function ProfileMusicChip({ title, artist, url }: { title: string | null; artist: string | null; url: string | null }) {
  if (!title && !artist && !url) return null;

  return (
    <a
      className="mt-3 inline-flex max-w-full items-center gap-2 rounded-pill border border-hm-gold/25 bg-hm-champagne/60 px-3 py-2 text-xs font-semibold text-hm-ink"
      href={url ?? "#"}
      target={url ? "_blank" : undefined}
      rel="noreferrer"
    >
      <Music className="h-4 w-4 text-hm-goldDeep" />
      <span className="truncate">{title || "Profilmusik"}{artist ? ` · ${artist}` : ""}</span>
      <Play className="h-3.5 w-3.5" />
    </a>
  );
}
