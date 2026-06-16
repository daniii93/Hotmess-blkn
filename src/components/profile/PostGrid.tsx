import Link from "next/link";
import { Camera } from "lucide-react";
import type { ProfilePost } from "@/features/profile/live-service";

export function PostGrid({ posts, emptyOwnProfile }: { posts: ProfilePost[]; emptyOwnProfile: boolean }) {
  if (!posts.length) {
    return (
      <div className="grid place-items-center rounded-card border border-dashed border-hm-gold/30 bg-hm-porcelain p-10 text-center">
        <Camera className="h-10 w-10 text-hm-gold" />
        <h3 className="mt-4 text-lg font-bold text-hm-ink">{emptyOwnProfile ? "Erstelle deinen ersten Beitrag" : "Keine Beitraege sichtbar"}</h3>
        <p className="mt-2 max-w-sm text-sm text-hm-inkSoft">
          {emptyOwnProfile ? "Teile ein Foto, ein Event oder einen Moment aus deiner HotMess Welt." : "Dieses Profil hat hier noch keine Inhalte freigegeben."}
        </p>
        {emptyOwnProfile ? <Link className="mt-5 rounded-pill bg-hm-gold px-5 py-3 text-sm font-bold text-hm-ink" href="/create">Erstellen</Link> : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {posts.map((post) => (
        <Link key={post.id} className="group relative aspect-square overflow-hidden rounded-[6px] bg-hm-champagne" href={`/feed?post=${post.id}`}>
          {post.mediaUrl ? <img src={post.mediaUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="grid h-full place-items-center p-3 text-center text-xs text-hm-inkSoft">{post.content ?? "HotMess"}</div>}
          {post.isPinned ? <span className="absolute left-1.5 top-1.5 rounded-pill bg-hm-ink/75 px-2 py-0.5 text-[10px] font-bold text-white">Fixiert</span> : null}
        </Link>
      ))}
    </div>
  );
}
