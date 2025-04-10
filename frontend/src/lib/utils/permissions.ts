import { Role } from "@/types/user";

/**
 * Check if the user has super admin privileges
 * @param userRole The user's role
 * @returns True if the user is a super admin
 */
export function isSuperAdmin(userRole?: string): boolean {
  return userRole === Role.SUPER_ADMIN;
}

/**
 * Check if the user has admin privileges (super admin or admin)
 * @param userRole The user's role
 * @returns True if the user is an admin
 */
export function isAdmin(userRole?: string): boolean {
  return userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
}

/**
 * Check if the user has pentester privileges
 * @param userRole The user's role
 * @returns True if the user is a pentester
 */
export function isPentester(userRole?: string): boolean {
  return userRole === Role.PENTESTER;
}

/**
 * Check if the user has client privileges
 * @param userRole The user's role
 * @returns True if the user is a client
 */
export function isClient(userRole?: string): boolean {
  return userRole === Role.CLIENT;
}

/**
 * Check if the user has access to a specific feature
 * @param userRole The user's role
 * @param requiredRoles The roles that have access to the feature
 * @returns True if the user has access
 */
export function hasAccess(userRole?: string, requiredRoles?: Role[]): boolean {
  if (!userRole || !requiredRoles) {
    return false;
  }
  
  // Super admin always has access to everything
  if (userRole === Role.SUPER_ADMIN) {
    return true;
  }
  
  return requiredRoles.includes(userRole as Role);
}
