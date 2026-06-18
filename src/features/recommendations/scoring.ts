import type { RecommendationReason } from "./types";

const weights: Record<RecommendationReason, number> = {
  shared_event: 30,
  nearby: 25,
  same_city: 25,
  business_fit: 25,
  service_fit: 20,
  active_project: 20,
  trusted: 20,
  upcoming: 15,
  new_activity: 15,
  benefit: 15,
  complete_profile: 10,
  community: 15,
};

export const scoreReasons = (reasons: RecommendationReason[]) =>
  reasons.reduce((sum, reason) => sum + weights[reason], 0);

export const sortRecommendations = <T extends { score: number; title: string }>(items: T[]) =>
  [...items].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"));
