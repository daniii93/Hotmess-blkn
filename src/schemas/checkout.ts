import { z } from "zod";

export const checkoutSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  ticketReservationId: z.string().min(1, "validation.ticket.reservationRequired"),
  paymentProvider: z.enum(["stripe", "paypal"]),
  addonIds: z.array(z.string()).default([]),
  discountCode: z.string().optional(),
});

export const groupCheckoutSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  ticketTypeId: z.string().min(1, "validation.ticket.typeRequired"),
  participantUserIds: z.array(z.string()).min(1, "validation.group.participantsRequired"),
  splitMode: z.enum(["leader_pays", "split_payment"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type GroupCheckoutInput = z.infer<typeof groupCheckoutSchema>;

