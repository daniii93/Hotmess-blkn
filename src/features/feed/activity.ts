import type { FriendActivity } from "./types";

export const createFollowActivity = (input: {
  actorId: string;
  actorName: string;
  targetUserId: string;
  targetUserName: string;
  visible: boolean;
  createdAt?: string;
}): FriendActivity => ({
  id: `follow:${input.actorId}:${input.targetUserId}:${input.createdAt ?? Date.now()}`,
  type: "follow",
  actorId: input.actorId,
  actorName: input.actorName,
  targetUserId: input.targetUserId,
  targetUserName: input.targetUserName,
  createdAt: input.createdAt ?? new Date().toISOString(),
  visible: input.visible,
});

export const createEventAttendanceActivity = (input: {
  actorId: string;
  actorName: string;
  eventId: string;
  eventTitle: string;
  visible: boolean;
  createdAt?: string;
}): FriendActivity => ({
  id: `attendance:${input.actorId}:${input.eventId}:${input.createdAt ?? Date.now()}`,
  type: "event_attendance",
  actorId: input.actorId,
  actorName: input.actorName,
  eventId: input.eventId,
  eventTitle: input.eventTitle,
  createdAt: input.createdAt ?? new Date().toISOString(),
  visible: input.visible,
});

export const createTicketPurchaseActivity = (input: {
  actorId: string;
  actorName: string;
  eventId: string;
  eventTitle: string;
  visible: boolean;
  createdAt?: string;
}): FriendActivity => ({
  id: `ticket:${input.actorId}:${input.eventId}:${input.createdAt ?? Date.now()}`,
  type: "ticket_purchase",
  actorId: input.actorId,
  actorName: input.actorName,
  eventId: input.eventId,
  eventTitle: input.eventTitle,
  createdAt: input.createdAt ?? new Date().toISOString(),
  visible: input.visible,
});

export const filterVisibleFriendActivities = (activities: FriendActivity[]): FriendActivity[] =>
  activities.filter((activity) => activity.visible);
