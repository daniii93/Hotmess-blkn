export type WaitlistPriorityInput = {
  joinedAt: string;
  position?: number;
  gender?: "female" | "male" | "diverse";
  membershipTier?: "member" | "passport_plus" | "passport_black";
  invitedByAmbassador?: boolean;
};

export type WaitlistPromotion = {
  entryId: string;
  gender?: "female" | "male" | "diverse";
  promotionExpiresAt: string;
};

export type WaitlistEntryStatus = "waiting" | "promoted" | "expired" | "cancelled";
