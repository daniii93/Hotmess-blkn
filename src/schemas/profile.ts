import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "validation.profile.firstNameRequired"),
  lastName: z.string().min(1, "validation.profile.lastNameRequired"),
  username: z.string().min(3, "validation.auth.usernameMin"),
  bio: z.string().max(500, "validation.profile.bioMax").optional(),
  city: z.string().min(1, "validation.profile.cityRequired"),
  country: z.string().min(1, "validation.profile.countryRequired"),
  isPrivate: z.boolean().default(false),
  showFollowers: z.boolean().default(true),
  showFollowing: z.boolean().default(true),
  showEventCount: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;

