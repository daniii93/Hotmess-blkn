import type { WaitlistPriorityInput, WaitlistPromotion } from "./types";

export const calculateWaitlistPriority = (input: WaitlistPriorityInput): number => {
  let priority = input.position ?? new Date(input.joinedAt).getTime();

  if (input.membershipTier === "passport_black") priority -= 3 * 60 * 60 * 1000;
  if (input.membershipTier === "passport_plus") priority -= 60 * 60 * 1000;
  if (input.invitedByAmbassador) priority -= 30 * 60 * 1000;

  return priority;
};

export const createWaitlistPromotion = (
  entryId: string,
  gender?: WaitlistPriorityInput["gender"],
  now = new Date(),
  holdMinutes = 15,
): WaitlistPromotion => ({
  entryId,
  gender,
  promotionExpiresAt: new Date(now.getTime() + holdMinutes * 60 * 1000).toISOString(),
});

export const getNextWaitlistPosition = (existingPositions: number[]): number =>
  existingPositions.length === 0 ? 1 : Math.max(...existingPositions) + 1;

export const sortWaitlistForPromotion = <T extends { priority: number; createdAt: string }>(entries: T[]): T[] =>
  [...entries].sort((a, b) => a.priority - b.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
