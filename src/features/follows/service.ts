import type { SocialRelationshipStatus } from "../social/types";

export const canSeeFollowerOnlyContent = (status: SocialRelationshipStatus): boolean =>
  status === "accepted";

export const canRequestFollow = (status: SocialRelationshipStatus): boolean =>
  status === "none";

export const getInitialFollowStatus = (isPrivateProfile: boolean): SocialRelationshipStatus =>
  isPrivateProfile ? "pending" : "accepted";

export const canShowFollowActivity = (params: {
  actorProfilePrivate: boolean;
  relationshipStatus: SocialRelationshipStatus;
}): boolean =>
  !params.actorProfilePrivate || params.relationshipStatus === "accepted";
