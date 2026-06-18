import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, GitBranch, Lightbulb, ShieldAlert, UsersRound, WalletCards } from "lucide-react";
import { getPlatformAnalyticsData } from "@/features/platform-analytics/service";
import { getRecommendationData } from "@/features/recommendations/service";
import { getCommunityData } from "@/features/communities/service";
import { getGraphData } from "@/features/graph/service";
import { getFoundationData } from "@/features/foundations/service";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  const [analytics, recommendations, communities, graph, foundations] = await Promise.all([
    getPlatformAnalyticsData(),
    getRecommendationData(),
    getCommunityData(),
    getGraphData(),
    getFoundationData(),
  ]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-admin/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-admin">HotMess Operating System</p>
        <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">Platform Intelligence fuer echte Verbindungen.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
          Diese Admin-Sicht verbindet Recommendations, Communities, Analytics, Graph und Wallet. Sie zeigt nur
          aggregierte oder administrative Signale und macht keine privaten Daten oeffentlich.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <OsCard href="#recommendations" icon={<Lightbulb className="h-5 w-5" />} title="Recommendations" value={recommendations.recommendations.length} />
        <OsCard href="#communities" icon={<UsersRound className="h-5 w-5" />} title="Communities" value={communities.communities.length} />
        <OsCard href="#analytics" icon={<BarChart3 className="h-5 w-5" />} title="Metrics" value={analytics.metrics.length} />
        <OsCard href="#graph" icon={<GitBranch className="h-5 w-5" />} title="Graph Edges" value={graph.relationships.length} />
        <OsCard href="/wallet" icon={<WalletCards className="h-5 w-5" />} title="Wallet Route" value={1} />
      </section>

      <section id="recommendations" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
        <Header title="Smart Recommendation Engine" href="/discover" cta="Discover" />
        {recommendations.recommendations.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.recommendations.slice(0, 6).map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Empty text={recommendations.empty} />
        )}
      </section>

      <section id="communities" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
        <Header title="Community Layer" href="/communities" cta="Communities" />
        {communities.communities.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {communities.communities.slice(0, 6).map((community) => (
              <Link key={community.id} href={community.href} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-admin/60">
                <p className="text-sm font-black text-hm-ink">{community.title}</p>
                <p className="mt-1 text-xs leading-5 text-hm-inkSoft">{community.text}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-hm-admin">{community.source}</p>
              </Link>
            ))}
          </div>
        ) : (
          <Empty text={communities.empty} />
        )}
      </section>

      <section id="analytics" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
        <Header title="Platform Analytics" href="/admin/analytics" cta="Analytics" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analytics.metrics.slice(0, 16).map((metric) => (
            <Link key={metric.label} href={metric.href} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-admin/60">
              <p className="font-display text-3xl text-hm-ink">{metric.value}</p>
              <p className="mt-1 text-sm font-bold text-hm-ink">{metric.label}</p>
              <p className="mt-1 text-xs text-hm-inkSoft">{metric.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="graph" className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
        <Header title="HotMess Graph" href="/admin/platform" cta="Intern" />
        <div className="grid gap-3 md:grid-cols-2">
          {graph.relationships.map((relationship) => (
            <div key={`${relationship.type}-${relationship.from}-${relationship.to}`} className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-hm-ink">{relationship.from} {"->"} {relationship.to}</p>
                <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{relationship.count}</span>
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-admin">{relationship.type}</p>
              <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{relationship.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <Header title="Wallet Readiness" href="/wallet" cta="Wallet" />
          <div className="grid gap-3">
            <Info title="Wallet ist Uebersicht, kein Bankkonto" text="Tickets, Benefits, Buchungen und Auftraege werden nur fuer berechtigte Nutzer angezeigt." />
            <Info title="Keine Fake-Werte" text="Wenn keine Items vorhanden sind, zeigt Wallet einen Empty State statt erfundener Werte." />
          </div>
        </section>

        <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <Header title="Quality Guardrails" href="/admin/quality" cta="Quality" />
          <div className="grid gap-3">
            {foundations.internalQuality.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-hm-ink"><ShieldAlert className="h-4 w-4 text-hm-admin" />{item.label}</span>
                <span className="font-display text-2xl text-hm-ink">{item.value}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function OsCard({ href, icon, title, value }: { href: string; icon: ReactNode; title: string; value: number }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-luxury transition hover:border-hm-admin/60">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-admin/10 text-hm-admin">{icon}</span>
      <p className="mt-4 font-display text-3xl text-hm-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{title}</p>
    </Link>
  );
}

function Header({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-admin">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-hm-admin/30 bg-hm-ivory px-4 py-5 text-sm leading-6 text-hm-inkSoft">{text}</p>;
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
      <p className="text-sm font-black text-hm-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </div>
  );
}
