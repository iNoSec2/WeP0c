'use client'

import { Role } from '@/types/user'
import { useAuth } from '@/hooks/useAuth'

export function withRoleCheck(WrappedComponent: React.ComponentType<any>, allowedRoles: Role[]) {
    return function WithRoleCheckComponent(props: any) {
        const { user } = useAuth()

        if (!user || !allowedRoles.includes(user.role as Role)) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}

// Example usage:
// const AdminOnlyComponent = withRoleCheck(MyComponent, [Role.SUPER_ADMIN, Role.ADMIN]) 