import type { UserRole } from "../../types/roles";

export type HotmessSession = {
  userId: string;
  role: UserRole;
  emailVerified: boolean;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  birthDate?: string;
  avatarUrl?: string;
  gender?: "female" | "male" | "diverse";
};

export const isVerifiedSession = (session?: HotmessSession | null): boolean =>
  Boolean(session?.emailVerified && session.verificationStatus === "verified");

export const isAdultSession = (session?: Pick<HotmessSession, "birthDate"> | null): boolean => {
  if (!session?.birthDate) return false;

  const birthDate = new Date(session.birthDate);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  const eighteenthBirthday = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  return eighteenthBirthday <= today;
};

export const hasRequiredIdentityProfile = (
  session?: Pick<HotmessSession, "avatarUrl" | "gender"> | null,
): boolean => Boolean(session?.avatarUrl && session.gender);
