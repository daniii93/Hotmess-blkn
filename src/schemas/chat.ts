import { z } from "zod";

export const sendChatMessageSchema = z.object({
  conversationId: z.string().min(1, "validation.chat.conversationRequired"),
  senderId: z.string().min(1, "validation.user.idRequired"),
  body: z.string().min(1, "validation.chat.messageRequired").max(2000, "validation.chat.messageMax"),
});

export const eventChatAccessSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  userId: z.string().min(1, "validation.user.idRequired"),
  ticketId: z.string().min(1, "validation.ticket.validTicketRequired"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type EventChatAccessInput = z.infer<typeof eventChatAccessSchema>;

