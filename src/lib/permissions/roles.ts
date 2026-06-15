import { roles } from "../../config/roles";
import type { Permission, UserRole } from "../../types/roles";

export { roles };
export type { Permission, UserRole };

export const permissionsByRole: Readonly<Record<UserRole, readonly Permission[]>> = {
  guest: roles.find((role) => role.role === "guest")?.permissions ?? [],
  user: roles.find((role) => role.role === "user")?.permissions ?? [],
  scanner: roles.find((role) => role.role === "scanner")?.permissions ?? [],
  admin: roles.find((role) => role.role === "admin")?.permissions ?? [],
};

