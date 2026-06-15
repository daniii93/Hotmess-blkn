import { communityRealtimeChannels } from "../../src/features/social/realtime";

describe("community realtime config", () => {
  it("prepares the expected realtime channels", () => {
    expect(communityRealtimeChannels.map((channel) => channel.channel)).toContain("chat_messages");
    expect(communityRealtimeChannels.map((channel) => channel.channel)).toContain("notifications");
  });
});
