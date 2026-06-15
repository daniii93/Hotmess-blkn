import { cronJobs } from "../../src/lib/monitoring/cron";
import { isWebhookSafeToProcess } from "../../src/lib/monitoring/webhooks";
import { getNotificationTargetPath, shouldSendPushNotification } from "../../src/lib/notifications/service";

describe("launch operations", () => {
  it("requires signature, idempotency and audit logging before webhook processing", () => {
    expect(isWebhookSafeToProcess({
      provider: "stripe",
      signatureVerified: true,
      idempotencyKey: "evt_123",
      auditLogged: true,
    })).toBe(true);

    expect(isWebhookSafeToProcess({
      provider: "paypal",
      signatureVerified: false,
      idempotencyKey: "wh_123",
      auditLogged: true,
    })).toBe(false);
  });

  it("keeps all required cron jobs declared", () => {
    expect(cronJobs.map((job) => job.key)).toEqual([
      "expire_reservations",
      "promote_waitlist",
      "expire_split_payments",
      "send_event_reminders",
      "complete_events",
      "cleanup_verification_files",
    ]);
  });

  it("respects push notification preferences", () => {
    expect(shouldSendPushNotification("chat", {
      pushEnabled: true,
      eventUpdates: true,
      chatMessages: true,
      waitlistUpdates: true,
      marketingEnabled: false,
    })).toBe(true);

    expect(shouldSendPushNotification("chat", {
      pushEnabled: true,
      eventUpdates: true,
      chatMessages: false,
      waitlistUpdates: true,
      marketingEnabled: false,
    })).toBe(false);
  });

  it("maps notification targets to app paths", () => {
    expect(getNotificationTargetPath("event", "event-1")).toBe("/events/event-1");
    expect(getNotificationTargetPath("chat", "chat-1")).toBe("/chat/chat-1");
  });
});
