export type EventAttendeeVisibility = "visible" | "hidden";

export type EventAttendeeListItem = {
  userId: string;
  name: string;
  avatarUrl?: string;
  visibility: EventAttendeeVisibility;
  isFollower: boolean;
  isMutualFriend: boolean;
};

export const filterVisibleEventAttendees = (
  attendees: EventAttendeeListItem[],
): EventAttendeeListItem[] => attendees.filter((attendee) => attendee.visibility === "visible");

export const getMutualEventAttendees = (
  attendees: EventAttendeeListItem[],
): EventAttendeeListItem[] => attendees.filter((attendee) => attendee.isMutualFriend);

export const getFollowerEventAttendees = (
  attendees: EventAttendeeListItem[],
): EventAttendeeListItem[] => attendees.filter((attendee) => attendee.isFollower);
