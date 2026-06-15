import type { GroupBookingMember, GroupBookingStatus } from "./types";

export const getGroupBookingStatus = (
  members: GroupBookingMember[],
  expiresAt: string,
  now = new Date(),
): GroupBookingStatus => {
  if (new Date(expiresAt).getTime() < now.getTime()) return "expired";
  if (members.length === 0) return "draft";
  if (members.every((member) => member.paid)) return "paid";
  return "awaiting_payments";
};

export const canCreateGroupBooking = (members: GroupBookingMember[]): boolean =>
  members.length > 0 && members.every((member) => Boolean(member.userId) && member.verified === true);

export const createSplitPaymentLinks = (
  members: GroupBookingMember[],
  now = new Date(),
  deadlineHours = 24,
) =>
  members.map((member) => ({
    memberEmail: member.email,
    amountCents: member.amountCents ?? 0,
    expiresAt: new Date(now.getTime() + deadlineHours * 60 * 60 * 1000).toISOString(),
  }));
