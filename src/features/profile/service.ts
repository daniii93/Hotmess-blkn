import type { CommunityProfile, ProfileCompleteness, ProfileCompletenessInput, ProfilePrivacy } from "./types";

const PROFILE_FIELDS: Array<keyof ProfileCompletenessInput> = [
  "avatarUrl",
  "bio",
  "birthdate",
  "interests",
  "city",
  "country",
];

export const getProfileCompleteness = (profile: ProfileCompletenessInput): ProfileCompleteness => {
  const missing = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });

  return {
    score: Math.round(((PROFILE_FIELDS.length - missing.length) / PROFILE_FIELDS.length) * 100),
    missing,
  };
};

export const hasVerificationBadge = (
  profile: Pick<CommunityProfile, "verificationStatus">,
): boolean => profile.verificationStatus === "verified";

export const canViewProfile = (params: {
  privacy: ProfilePrivacy;
  isOwner: boolean;
  isFollower: boolean;
}): boolean => {
  if (params.isOwner) return true;
  if (params.privacy === "public") return true;
  if (params.privacy === "followers_only") return params.isFollower;
  return false;
};

export const canShowEventAttendance = (
  profile: Pick<CommunityProfile, "showEventAttendance">,
  viewerIsOwnerOrFollower: boolean,
): boolean => profile.showEventAttendance && viewerIsOwnerOrFollower;
