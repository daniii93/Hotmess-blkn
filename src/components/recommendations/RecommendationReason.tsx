import type { RecommendationReason as Reason } from "@/features/recommendations/types";
import { getRecommendationReasonLabel } from "@/features/recommendations/reasons";

export function RecommendationReason({ reason }: { reason: Reason }) {
  return (
    <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">
      {getRecommendationReasonLabel(reason)}
    </span>
  );
}
