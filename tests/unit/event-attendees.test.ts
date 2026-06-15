import {
  filterVisibleEventAttendees,
  getFollowerEventAttendees,
  getMutualEventAttendees,
} from "../../src/features/events/attendees";

describe("event attendee helpers", () => {
  const attendees = [
    { userId: "a", name: "Anna", visibility: "visible" as const, isFollower: true, isMutualFriend: true },
    { userId: "b", name: "Ben", visibility: "hidden" as const, isFollower: false, isMutualFriend: false },
  ];

  it("filters visible attendees", () => {
    expect(filterVisibleEventAttendees(attendees)).toHaveLength(1);
  });

  it("filters follower and mutual attendees", () => {
    expect(getFollowerEventAttendees(attendees)).toHaveLength(1);
    expect(getMutualEventAttendees(attendees)).toHaveLength(1);
  });
});
