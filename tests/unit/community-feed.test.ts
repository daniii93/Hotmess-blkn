import { canCreatePost, sortFeedNewestFirst } from "../../src/features/feed/service";
import { createEventAttendanceActivity, filterVisibleFriendActivities } from "../../src/features/feed/activity";
import { shouldPushFeedNotification } from "../../src/features/feed/notifications";

describe("community feed service", () => {
  it("sorts posts newest first", () => {
    const posts = [
      { createdAt: "2026-01-01T10:00:00.000Z" },
      { createdAt: "2026-01-02T10:00:00.000Z" },
    ];

    expect(sortFeedNewestFirst(posts)[0]?.createdAt).toBe("2026-01-02T10:00:00.000Z");
  });

  it("requires text or image content for posts", () => {
    expect(canCreatePost({ text: "HotMess tonight" })).toBe(true);
    expect(canCreatePost({})).toBe(false);
  });

  it("keeps only visible friend activity", () => {
    const activity = createEventAttendanceActivity({
      actorId: "u1",
      actorName: "Anna",
      eventId: "e1",
      eventTitle: "HOTMESS",
      visible: true,
    });

    expect(filterVisibleFriendActivities([activity, { ...activity, id: "hidden", visible: false }])).toHaveLength(1);
  });

  it("marks chat and event updates as push-worthy", () => {
    expect(shouldPushFeedNotification("chat_message")).toBe(true);
    expect(shouldPushFeedNotification("event_update")).toBe(true);
  });
});
