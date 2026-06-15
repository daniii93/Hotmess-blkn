import type { CommunityKpiSnapshot } from "./types";

export const calculateEngagementRate = (kpis: Pick<CommunityKpiSnapshot, "posts" | "comments" | "likes">): number => {
  if (kpis.posts === 0) return 0;
  return (kpis.comments + kpis.likes) / kpis.posts;
};

export const createCommunityKpiSnapshot = (snapshot: CommunityKpiSnapshot): CommunityKpiSnapshot => snapshot;
