import type { EventPostTrigger, FeedPost, FeedRankingSignal } from "./types";

export const scoreFeedPost = (signal: FeedRankingSignal): number => {
  const followBoost = signal.isFollowedAuthor ? 40 : 0;
  const eventBoost = signal.sharesEvent ? 25 : 0;

  return followBoost + eventBoost + signal.recencyScore + signal.engagementScore;
};

export const sortFeedSignals = (signals: FeedRankingSignal[]): FeedRankingSignal[] =>
  [...signals].sort((a, b) => scoreFeedPost(b) - scoreFeedPost(a));

export const sortFeedNewestFirst = <T extends Pick<FeedPost, "createdAt">>(posts: T[]): T[] =>
  [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const canCreatePost = (input: { text?: string; imageUrl?: string }): boolean =>
  Boolean(input.text?.trim() || input.imageUrl);

export const createEventPostDraft = (input: {
  trigger: EventPostTrigger;
  eventId: string;
  eventTitle: string;
  authorId: string;
  createdAt?: string;
}): FeedPost => {
  const contentByTrigger: Record<EventPostTrigger, string> = {
    event_published: `${input.eventTitle} ist jetzt live.`,
    event_sold_out: `${input.eventTitle} ist ausverkauft.`,
    event_cancelled: `${input.eventTitle} wurde abgesagt.`,
  };

  return {
    id: `${input.trigger}:${input.eventId}`,
    authorId: input.authorId,
    type: "event",
    eventId: input.eventId,
    content: contentByTrigger[input.trigger],
    visibility: "members",
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
};
