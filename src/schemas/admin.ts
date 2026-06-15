import { z } from "zod";

export const adminEntityIdSchema = z.object({
  id: z.string().min(1, "validation.admin.idRequired"),
});

export const scannerAccessSchema = z.object({
  userId: z.string().min(1, "validation.user.idRequired"),
  eventId: z.string().min(1, "validation.event.idRequired"),
  active: z.boolean().default(true),
});

export const discountCodeSchema = z.object({
  code: z.string().min(3, "validation.discount.codeMin"),
  eventId: z.string().optional(),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive("validation.discount.valuePositive"),
});

export type AdminEntityIdInput = z.infer<typeof adminEntityIdSchema>;
export type ScannerAccessInput = z.infer<typeof scannerAccessSchema>;
export type DiscountCodeInput = z.infer<typeof discountCodeSchema>;

