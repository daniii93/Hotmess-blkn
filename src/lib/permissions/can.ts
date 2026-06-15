import type { Permission, UserRole } from "../../types/roles";
import { permissionsByRole } from "./roles";

export const can = (role: UserRole, permission: Permission): boolean =>
  permissionsByRole[role]?.includes(permission) ?? false;

export const canAll = (role: UserRole, permissions: readonly Permission[]): boolean =>
  permissions.every((permission) => can(role, permission));

export const canAny = (role: UserRole, permissions: readonly Permission[]): boolean =>
  permissions.some((permission) => can(role, permission));

