import type { AuditAction, AuditEvent } from "../types/audit";

export type AuditLogInput = {
  action: AuditAction;
  userId: string;
  role: AuditEvent["actor"]["role"];
  targetType?: string;
  targetId?: string;
  metadata?: AuditEvent["metadata"];
};

export const createAuditEvent = (input: AuditLogInput): AuditEvent => ({
  id: crypto.randomUUID(),
  action: input.action,
  actor: {
    userId: input.userId,
    role: input.role,
  },
  ...(input.targetType ? { targetType: input.targetType } : {}),
  ...(input.targetId ? { targetId: input.targetId } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
  createdAt: new Date().toISOString(),
});

export const logAuditEvent = async (input: AuditLogInput): Promise<AuditEvent> => {
  const event = createAuditEvent(input);

  // TODO(section-database): persist to audit table once the Supabase schema section is active.
  return event;
};

