import Link from "next/link";
import { PageShell } from "@/components/shell/page-shell";

export default function WatchPage() {
  return (
    <>
      <PageShell pageKey="watch" emptyKey="feed" />
      <section className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6 lg:px-10">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Watch</p>
          <h1 className="hm-display mt-3 text-3xl text-hm-ink">Video-Feed vorbereitet</h1>
          <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
            Der Reels/Watch-Bereich ist als eigener Haupttab vorbereitet. Bis der Video-Feed live geht,
            bleibt Home der aktive Content-Loop.
          </p>
          <Link href="/feed" className="mt-5 inline-flex rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-porcelain">
            Zum Feed
          </Link>
        </div>
      </section>
    </>
  );
}

