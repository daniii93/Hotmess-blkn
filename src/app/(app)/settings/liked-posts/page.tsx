import Link from "next/link";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LikedPostRow = {
  created_at: string;
  posts: {
    id: string;
    content: string | null;
    body: string | null;
    image_url: string | null;
    media_urls: string[] | null;
    created_at: string;
    profiles: {
      username: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
};

export default async function LikedPostsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/liked-posts");

  const { data } = await supabase
    .from("likes")
    .select("created_at,posts(id,content,body,image_url,media_urls,created_at,profiles!posts_user_id_fkey(username,first_name,last_name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<LikedPostRow[]>();

  const posts = (data ?? []).map((row) => row.posts).filter(Boolean);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Deine Aktivitaet</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Mit Gefaellt mir markiert</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Beitraege, die du geliked hast. Sichtbarkeit folgt weiterhin den Profil-Privatsphaere-Regeln.</p>
      </section>

      <section className="mt-5 grid gap-3">
        {posts.length ? posts.map((post) => {
          const author = post?.profiles ? `${post.profiles.first_name ?? ""} ${post.profiles.last_name ?? ""}`.trim() || post.profiles.username : "HotMess";
          const image = post?.image_url ?? post?.media_urls?.[0] ?? null;
          return (
            <Link key={post!.id} className="flex items-center gap-3 rounded-card border border-hm-border bg-hm-porcelain p-3 shadow-soft hover:bg-hm-champagne/35" href="/feed">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-hm-champagne text-hm-inkSoft">
                {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Heart className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-hm-ink">{post?.content || post?.body || "HotMess Beitrag"}</p>
                <p className="mt-1 text-xs text-hm-inkSoft">{author} · {new Date(post!.created_at).toLocaleDateString("de-DE")}</p>
              </div>
            </Link>
          );
        }) : <p className="rounded-card border border-hm-border bg-hm-porcelain p-5 text-sm text-hm-inkSoft shadow-soft">Du hast noch keine Beitraege markiert.</p>}
      </section>
    </main>
  );
}
