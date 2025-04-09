import { useAuth } from './useAuth'
import { Role } from '@/types/user'

interface PermissionConfig {
    [key: string]: Role[]
}

// Define permissions for different actions
const permissionConfig: PermissionConfig = {
    // Project permissions
    createProject: [Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT],
    editProject: [Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT],
    deleteProject: [Role.SUPER_ADMIN, Role.ADMIN],
    viewProject: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],

    // Vulnerability permissions
    createVulnerability: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    editVulnerability: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    deleteVulnerability: [Role.SUPER_ADMIN, Role.ADMIN],
    viewVulnerability: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],

    // User management
    manageUsers: [Role.SUPER_ADMIN, Role.ADMIN],
    assignPentesters: [Role.SUPER_ADMIN, Role.ADMIN],
    viewReports: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],

    // Admin panel
    accessAdminPanel: [Role.SUPER_ADMIN, Role.ADMIN],

    // Pentester specific permissions
    managePentests: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    createPentestReport: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    editPentestReport: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    deletePentestReport: [Role.SUPER_ADMIN, Role.ADMIN],
    viewPentestReport: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],

    // Pentester tools and resources
    accessPentestTools: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    managePentestTemplates: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    viewPentestMethodology: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    managePentestSpecialities: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],

    // Time management
    manageTimesheets: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    viewCalendar: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],

    // Client data
    viewClientData: [Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT],

    // Pentester profile
    managePentesterProfile: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    updatePentesterSpecialities: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    viewPentesterAssignments: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
}

export function usePermissions() {
    const { user } = useAuth()

    const can = (action: keyof typeof permissionConfig): boolean => {
        if (!user) return false

        const allowedRoles = permissionConfig[action]
        return allowedRoles?.includes(user.role as Role) || false
    }

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user) return false

        const rolesToCheck = Array.isArray(roles) ? roles : [roles]
        return rolesToCheck.includes(user.role as Role)
    }

    const isAdmin = (): boolean => {
        return hasRole([Role.SUPER_ADMIN, Role.ADMIN])
    }

    const isPentester = (): boolean => {
        return hasRole(Role.PENTESTER)
    }

    const isClient = (): boolean => {
        return hasRole(Role.CLIENT)
    }

    // Pentester-specific helper functions
    const canManagePentests = (): boolean => {
        return can('managePentests')
    }

    const canCreatePentestReport = (): boolean => {
        return can('createPentestReport')
    }

    const canEditPentestReport = (): boolean => {
        return can('editPentestReport')
    }

    const canAccessPentestTools = (): boolean => {
        return can('accessPentestTools')
    }

    const canManageTimesheets = (): boolean => {
        return can('manageTimesheets')
    }

    const canViewCalendar = (): boolean => {
        return can('viewCalendar')
    }

    const canManageSpecialities = (): boolean => {
        return can('managePentestSpecialities')
    }

    return {
        can,
        hasRole,
        isAdmin,
        isPentester,
        isClient,
        // Pentester-specific helpers
        canManagePentests,
        canCreatePentestReport,
        canEditPentestReport,
        canAccessPentestTools,
        canManageTimesheets,
        canViewCalendar,
        canManageSpecialities,
    }
}

// Example usage:
// const { can, isAdmin } = usePermissions()
// if (can('createProject')) { ... }
// if (isAdmin()) { ... } 