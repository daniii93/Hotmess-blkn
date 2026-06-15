export type BroadcastChannel = "push" | "email" | "in_app";

export type BroadcastSegment =
  | "all_users"
  | "event_attendees"
  | "waitlist"
  | "city"
  | "country"
  | "verified_users"
  | "unverified_users"
  | "vip_buyers"
  | "hotel_bookers";

export type BroadcastDraft = {
  channels: BroadcastChannel[];
  segment: BroadcastSegment;
  title: string;
  body: string;
};

export const canSendBroadcast = (draft: BroadcastDraft): boolean =>
  draft.channels.length > 0 && draft.title.trim().length > 0 && draft.body.trim().length > 0;
