import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, CalendarDays, Gift, Sparkles, UserRound, UsersRound, Wrench } from "lucide-react";
import type { RecommendationItem } from "@/features/recommendations/types";
import { RecommendationReason } from "./RecommendationReason";

const icons = {
  event: CalendarDays,
  person: UserRound,
  business: Briefcase,
  service: Wrench,
  project: Wrench,
  benefit: Gift,
  creator: Sparkles,
  digital: Sparkles,
  community: UsersRound,
  job: Briefcase,
};

export function RecommendationCard({ item }: { item: RecommendationItem }) {
  const Icon = icons[item.kind] ?? BadgeCheck;

  return (
    <Link href={item.href} className="group rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{item.source}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{item.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.reasons.slice(0, 2).map((reason) => (
          <RecommendationReason key={reason} reason={reason} />
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        Oeffnen <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
