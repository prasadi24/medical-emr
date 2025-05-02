"use client"

import { useAuth } from "@/contexts/auth-context"
import type { ReactNode } from "react"

type RequireRoleProps = {
    children: ReactNode
    roles: string[]
    fallback?: ReactNode
}

export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
    const { hasRole } = useAuth()

    const hasRequiredRole = roles.some((role) => hasRole(role))

    if (!hasRequiredRole) {
        return fallback
    }

    return <>{children}</>
}
