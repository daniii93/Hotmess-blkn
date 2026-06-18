import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Briefcase, CalendarDays, Gift, Lock, Sparkles, UsersRound, Wrench } from "lucide-react";
import { getCommunityData } from "@/features/communities/service";
import type { CommunityKind } from "@/features/communities/types";

export const dynamic = "force-dynamic";

const icons: Record<CommunityKind, ReactNode> = {
  business: <Briefcase className="h-5 w-5" />,
  event: <CalendarDays className="h-5 w-5" />,
  service: <Wrench className="h-5 w-5" />,
  creator: <Sparkles className="h-5 w-5" />,
  digital: <Sparkles className="h-5 w-5" />,
  member: <Gift className="h-5 w-5" />,
};

export default async function CommunitiesPage() {
  const data = await getCommunityData();

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Communities</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">Raeume fuer echte Interessen, Regionen, Events und Business.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
          HotMess baut Communities nicht als laute Gruppenwand. Wir nutzen vorhandene Gruppen, Event-Kontexte,
          Service-Kategorien und Fachbereiche. Private Gruppen bleiben geschuetzt.
        </p>
      </section>

      {data.communities.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.communities.map((community) => (
            <Link key={community.id} href={community.href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icons[community.kind]}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">
                  {community.private ? <Lock className="h-3 w-3" /> : null}
                  {community.source}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-black text-hm-ink">{community.title}</h2>
              <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{community.text}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
                {community.memberCount === null ? "Mitglieder nach Kontext" : `${community.memberCount} Mitglieder/Teilnehmer`}
              </p>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-card border border-dashed border-hm-gold/35 bg-hm-porcelain p-6 shadow-luxury">
          <UsersRound className="h-7 w-7 text-hm-goldDeep" />
          <p className="mt-4 text-sm leading-6 text-hm-inkSoft">{data.empty}</p>
          <Link href="/business/groups" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
            Business Gruppen ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Principle title="Keine Fake-Communities" text="Raeume erscheinen nur aus bestehenden Gruppen, Events, Kategorien oder echten Modul-Kontexten." />
        <Principle title="Privatsphaere zuerst" text="Private Communities und Dating-nahe Raeume bleiben geschuetzt und werden nicht offen empfohlen." />
        <Principle title="Chat wiederverwenden" text="Wo Chat schon existiert, wird keine zweite Community-Engine gebaut." />
      </section>
    </main>
  );
}

function Principle({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <UsersRound className="h-5 w-5 text-hm-goldDeep" />
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
    </article>
  );
}
