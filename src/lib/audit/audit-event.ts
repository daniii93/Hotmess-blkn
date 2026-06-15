import type { AuditEventName } from "./events";

export type AuditEvent = {
  actorId?: string;
  action: AuditEventName;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export const createAuditEvent = (event: AuditEvent): AuditEvent & { createdAt: string } => ({
  ...event,
  metadata: event.metadata ?? {},
  createdAt: new Date().toISOString(),
});
