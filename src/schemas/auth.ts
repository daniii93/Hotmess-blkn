import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "validation.auth.identifierRequired"),
  password: z.string().min(1, "validation.auth.passwordRequired"),
});

export const registerSchema = z.object({
  email: z.string().email("validation.auth.emailInvalid"),
  firstName: z.string().min(1, "validation.profile.firstNameRequired"),
  lastName: z.string().min(1, "validation.profile.lastNameRequired"),
  username: z.string().min(3, "validation.auth.usernameMin"),
  password: z.string().min(8, "validation.auth.passwordMin"),
  birthDate: z.string().min(1, "validation.profile.birthDateRequired"),
  gender: z.enum(["female", "male", "diverse"], { message: "validation.profile.genderRequired" }),
  avatarUrl: z.string().url("validation.profile.avatarRequired"),
  city: z.string().min(1, "validation.profile.cityRequired"),
  country: z.string().min(1, "validation.profile.countryRequired"),
  acceptedTerms: z.literal(true, { message: "validation.legal.termsRequired" }),
}).refine((input) => {
  const birthDate = new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  const eighteenthBirthday = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  return eighteenthBirthday <= today;
}, {
  message: "Du musst mindestens 18 Jahre alt sein.",
  path: ["birthDate"],
});

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "validation.auth.verificationCodeInvalid"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
