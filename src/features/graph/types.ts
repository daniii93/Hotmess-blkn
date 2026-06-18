export type GraphEntityType =
  | "user"
  | "event"
  | "ticket"
  | "business_profile"
  | "service_provider"
  | "service_project"
  | "benefit"
  | "partner"
  | "creator"
  | "digital_offer"
  | "community"
  | "job"
  | "conversation";

export type GraphRelationshipType =
  | "follows"
  | "attended_event"
  | "has_ticket"
  | "owns_business_profile"
  | "provider_for_category"
  | "created_project"
  | "completed_order"
  | "reviewed"
  | "member_of_community"
  | "partner_offer"
  | "creator_offer"
  | "recommended"
  | "trusted_signal"
  | "booked"
  | "applied_for_job";

export type GraphRelationship = {
  type: GraphRelationshipType;
  from: GraphEntityType;
  to: GraphEntityType;
  count: number;
  publicSafe: boolean;
  note: string;
};
