import { z } from "zod";

export const eventSlugSchema = z.object({
  slug: z.string().min(1, "validation.event.slugRequired"),
});

export const eventGenderConfigSchema = z.object({
  eventId: z.string().min(1, "validation.event.idRequired"),
  femaleCapacity: z.number().int().nonnegative(),
  maleCapacity: z.number().int().nonnegative(),
  diverseCapacity: z.number().int().nonnegative(),
  enabled: z.boolean().default(true),
});

export const eventCreateSchema = z.object({
  title: z.string().min(1, "validation.event.titleRequired"),
  slug: z.string().min(1, "validation.event.slugRequired"),
  venueId: z.string().min(1, "validation.event.venueRequired"),
  startsAt: z.string().min(1, "validation.event.startsAtRequired"),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
});

export type EventSlugInput = z.infer<typeof eventSlugSchema>;
export type EventGenderConfigInput = z.infer<typeof eventGenderConfigSchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;

