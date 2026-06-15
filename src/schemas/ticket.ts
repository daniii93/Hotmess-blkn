import { z } from "zod";

export const reserveTicketSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  ticketTypeId: z.string().min(1, "validation.ticket.typeRequired"),
  userId: z.string().min(1, "validation.user.idRequired"),
  gender: z.enum(["female", "male", "diverse"], { message: "validation.profile.genderRequired" }),
});

export const scanTicketSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  qrToken: z.string().min(1, "validation.ticket.qrRequired"),
  scannerId: z.string().min(1, "validation.scanner.idRequired"),
});

export type ReserveTicketInput = z.infer<typeof reserveTicketSchema>;
export type ScanTicketInput = z.infer<typeof scanTicketSchema>;

