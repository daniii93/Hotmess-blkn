"use client";

import Link from "next/link";
import { Edit3 } from "lucide-react";
import type { InboxAuthor } from "@/features/inbox/live-service";

export function InboxHeader({ viewer }: { viewer: InboxAuthor }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-hm-ivory/95 px-1 py-3 backdrop-blur">
      <button className="hm-display rounded-full px-2 text-2xl text-hm-ink" type="button" aria-label="Konto wechseln">
        {viewer.username} <span className="font-sans text-base text-hm-goldDeep">v</span>
      </button>
      <Link
        aria-label="Neue Nachricht"
        className="grid size-11 place-items-center rounded-full border border-hm-gold/40 bg-hm-porcelain text-hm-goldDeep shadow-sm"
        href="/chat/new"
      >
        <Edit3 className="h-5 w-5" />
      </Link>
    </header>
  );
}
