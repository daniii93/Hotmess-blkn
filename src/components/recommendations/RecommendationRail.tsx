import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RecommendationItem } from "@/features/recommendations/types";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationEmptyState } from "./RecommendationEmptyState";

export function RecommendationRail({
  title = "Smart Recommendations",
  items,
  emptyText,
}: {
  title?: string;
  items: RecommendationItem[];
  emptyText: string;
}) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
          <p className="mt-1 text-sm text-hm-inkSoft">Erklaerbare Empfehlungen aus echten Plattform-Signalen.</p>
        </div>
        <Link href="/discover" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
          Discover <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {items.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <RecommendationEmptyState text={emptyText} />
      )}
    </section>
  );
}
