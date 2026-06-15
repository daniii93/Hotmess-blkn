import type { HotmessSession } from "./session";
import { hasRequiredIdentityProfile, isAdultSession } from "./session";

export const canBuyTicket = (session?: HotmessSession | null): boolean =>
  Boolean(
    session &&
      session.emailVerified &&
      session.verificationStatus === "verified" &&
      isAdultSession(session) &&
      hasRequiredIdentityProfile(session),
  );

export const canEnterProtectedArea = (session?: HotmessSession | null): boolean =>
  Boolean(session && session.emailVerified);

export const shouldStartIdentityVerification = (session?: HotmessSession | null): boolean =>
  Boolean(session && session.emailVerified && session.verificationStatus === "unverified");
