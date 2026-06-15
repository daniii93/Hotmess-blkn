import { canViewProfile, hasVerificationBadge } from "../../src/features/profile/service";
import { createProfileAnalyticsSnapshot } from "../../src/features/profile/analytics";

describe("community profile service", () => {
  it("shows verified badge only for verified profiles", () => {
    expect(hasVerificationBadge({ verificationStatus: "verified" })).toBe(true);
    expect(hasVerificationBadge({ verificationStatus: "pending" })).toBe(false);
  });

  it("requires follower access for followers-only profiles", () => {
    expect(canViewProfile({ privacy: "followers_only", isOwner: false, isFollower: true })).toBe(true);
    expect(canViewProfile({ privacy: "followers_only", isOwner: false, isFollower: false })).toBe(false);
  });

  it("keeps profile analytics fields explicit", () => {
    expect(createProfileAnalyticsSnapshot({
      followerCount: 10,
      followingCount: 4,
      eventsVisited: 3,
      postsCount: 2,
    }).eventsVisited).toBe(3);
  });
});
