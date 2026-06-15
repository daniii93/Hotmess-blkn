export type ProfileAnalyticsSnapshot = {
  followerCount: number;
  followingCount: number;
  eventsVisited: number;
  postsCount: number;
};

export const createProfileAnalyticsSnapshot = (
  snapshot: ProfileAnalyticsSnapshot,
): ProfileAnalyticsSnapshot => snapshot;
