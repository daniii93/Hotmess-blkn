import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecommendationEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href="/discover" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        Discover nutzen <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
