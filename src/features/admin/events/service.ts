import { canPublishEvent, getNextEventStatus } from "../../events/service";
import type { HotmessEvent } from "../../events/types";

export type AdminEventAction = "create" | "edit" | "publish" | "cancel" | "complete" | "duplicate" | "archive";

export const canAdminPublishEvent = (event: Partial<HotmessEvent>): boolean =>
  canPublishEvent(event);

export const applyAdminEventLifecycleAction = (
  event: Pick<HotmessEvent, "status" | "startAt" | "endAt">,
  action: Extract<AdminEventAction, "publish" | "cancel" | "complete">,
): HotmessEvent["status"] => {
  if (action === "publish") return getNextEventStatus(event, "publish");
  if (action === "cancel") return getNextEventStatus(event, "cancel");
  return getNextEventStatus(event, "complete");
};
