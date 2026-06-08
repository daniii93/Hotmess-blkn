export type UserRole = "guest" | "member" | "passport_plus" | "passport_black" | "admin" | "partner" | "sponsor";

export const userRoles: UserRole[] = [
  "guest",
  "member",
  "passport_plus",
  "passport_black",
  "admin",
  "partner",
  "sponsor",
];

export const memberRoles: UserRole[] = ["member", "passport_plus", "passport_black", "admin"];
export const partnerRoles: UserRole[] = ["partner", "sponsor", "admin"];

export const isMemberRole = (role: UserRole): boolean => memberRoles.includes(role);
export const isPartnerRole = (role: UserRole): boolean => partnerRoles.includes(role);
export const isAdminRole = (role: UserRole): boolean => role === "admin";
