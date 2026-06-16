import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PersonRow = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  verification_status: string | null;
};

export default async function DiscoverPeoplePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/explore/people");

  const { data } = await supabase
    .from("profiles")
    .select("id,username,first_name,last_name,avatar_url,city,verification_status")
    .neq("id", user.id)
    .eq("is_banned", false)
    .eq("suggestible", true)
    .limit(24)
    .returns<PersonRow[]>();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Personen entdecken</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Freunde finden & einladen</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Vorschlaege respektieren Blockierungen, private Inhalte bleiben privat. Voller Ranking-Algorithmus folgt ueber die Suggestion-Engine.</p>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((person) => {
          const name = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim() || person.username;
          const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
          return (
            <Link key={person.id} className="flex items-center gap-3 rounded-card border border-hm-border bg-hm-porcelain p-3 shadow-soft hover:bg-hm-champagne/35" href={`/u/${person.username}`}>
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-hm-champagne text-sm font-bold text-hm-ink">
                {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-hm-ink">{name}</p>
                <p className="truncate text-xs text-hm-inkSoft">@{person.username}{person.city ? ` · ${person.city}` : ""}</p>
              </div>
              <UserPlus className="h-5 w-5 text-hm-goldDeep" />
            </Link>
          );
        })}
        {!(data ?? []).length ? <p className="rounded-card border border-hm-border bg-hm-porcelain p-5 text-sm text-hm-inkSoft shadow-soft">Aktuell keine Vorschlaege verfuegbar.</p> : null}
      </section>
    </main>
  );
}
