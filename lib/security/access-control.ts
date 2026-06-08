import { rolePermissions, type Permission, type SecurityRole } from "./permissions";

export const hasPermission = (role: SecurityRole, permission: Permission): boolean =>
  rolePermissions[role]?.includes(permission) ?? false;

export const canAccessAdmin = (role: SecurityRole): boolean => hasPermission(role, "access_admin");

export const canAccessPartnerPortal = (role: SecurityRole): boolean =>
  hasPermission(role, "access_partner_portal");
