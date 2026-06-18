export type RecommendationKind =
  | "event"
  | "person"
  | "business"
  | "service"
  | "project"
  | "benefit"
  | "creator"
  | "digital"
  | "community"
  | "job";

export type RecommendationReason =
  | "nearby"
  | "same_city"
  | "shared_event"
  | "business_fit"
  | "service_fit"
  | "active_project"
  | "trusted"
  | "new_activity"
  | "upcoming"
  | "benefit"
  | "complete_profile"
  | "community";

export type RecommendationItem = {
  id: string;
  kind: RecommendationKind;
  title: string;
  text: string;
  href: string;
  score: number;
  reasons: RecommendationReason[];
  source: string;
  sponsored?: boolean;
};

export type RecommendationContext = {
  userId: string | null;
  city: string | null;
  verified: boolean;
  businessEnabled: boolean;
  datingEnabled: boolean;
  providerVerified: boolean;
};
