import type { NotificationRequest } from "../notifications/service";

export const createVerificationApprovedNotifications = (
  userId: string,
): NotificationRequest[] => [
  {
    userId,
    intent: "verification",
    channels: ["in_app", "email", "push"],
    title: "Deine Verifikation ist bestaetigt",
    body: "Dein HOTMESS Konto ist verifiziert. Du kannst jetzt Tickets kaufen.",
  },
];

export const createVerificationRejectedNotifications = (
  userId: string,
): NotificationRequest[] => [
  {
    userId,
    intent: "verification",
    channels: ["in_app", "email", "push"],
    title: "Deine Verifikation wurde abgelehnt",
    body: "Bitte pruefe deine Angaben und starte die Verifikation erneut.",
  },
];
