import { z } from "zod";

export const addonBookingSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  userId: z.string().min(1, "validation.user.idRequired"),
  validTicketId: z.string().min(1, "validation.ticket.validTicketRequired"),
  addonType: z.enum([
    "hotel",
    "table",
    "drink_package",
    "fruit_platter",
    "bottle_service",
    "fast_lane",
    "birthday_package",
  ]),
  addonId: z.string().min(1, "validation.addons.idRequired"),
});

export const tableAddonDependencySchema = z.object({
  tableBookingId: z.string().min(1, "validation.addons.tableRequired"),
});

export type AddonBookingInput = z.infer<typeof addonBookingSchema>;
export type TableAddonDependencyInput = z.infer<typeof tableAddonDependencySchema>;

