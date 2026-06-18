import type { RecommendationItem } from "@/features/recommendations/types";
import { RecommendationRail } from "./RecommendationRail";

export function PersonalizedSection({ items, emptyText }: { items: RecommendationItem[]; emptyText: string }) {
  return <RecommendationRail title="Persoenlich fuer dich" items={items} emptyText={emptyText} />;
}
