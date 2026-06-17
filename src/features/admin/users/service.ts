export type AdminUserAction = "block" | "reactivate" | "change_role" | "review_verification" | "view_profile";

export type AdminUserRow = {
  userId: string;
  name: string;
  email: string;
  city?: string;
  country?: string;
  gender: "female" | "male" | "diverse";
  verificationStatus: "pending" | "verified" | "rejected" | "suspended" | "unverified";
  role: "user" | "scanner" | "admin";
  active: boolean;
  registeredAt: string;
  ticketsBought: number;
  eventsVisited: number;
};

export const canChangeUserRole = (target: AdminUserRow, newRole: AdminUserRow["role"]): boolean =>
  target.role !== newRole;
