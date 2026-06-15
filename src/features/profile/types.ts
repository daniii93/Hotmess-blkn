export type ProfileCompletenessInput = {
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  birthdate?: string;
  interests?: string[];
  city?: string;
  country?: string;
};

export type ProfileCompleteness = {
  score: number;
  missing: Array<keyof ProfileCompletenessInput>;
};

export type ProfilePrivacy = "public" | "followers_only" | "private";

export type CommunityProfile = {
  userId: string;
  avatarUrl: string;
  coverUrl?: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  bio?: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  privacy: ProfilePrivacy;
  showEventAttendance: boolean;
  eventsVisited: number;
  followerCount: number;
  followingCount: number;
};
