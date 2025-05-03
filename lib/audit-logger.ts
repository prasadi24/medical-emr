import { createAuditLog, type AuditLogData } from "@/app/actions/audit-log-actions"

export async function logActivity(data: AuditLogData) {
    try {
        await createAuditLog(data)
    } catch (error) {
        console.error("Failed to log activity:", error)
    }
}

// Helper function to create a before/after comparison for updates
export function createChangeLog(before: any, after: any) {
    const changes: Record<string, { before: any; after: any }> = {}

    // Find all keys in either object
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])

    allKeys.forEach((key) => {
        // Skip internal fields and timestamps
        if (key === "id" || key === "created_at" || key === "updated_at") return

        const beforeVal = before?.[key]
        const afterVal = after?.[key]

        // Only record if values are different
        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
            changes[key] = {
                before: beforeVal,
                after: afterVal,
            }
        }
    })

    return Object.keys(changes).length > 0 ? changes : null
}

// Helper functions for common operations
export const auditLogger = {
    create: async (resourceType: string, resourceId: string, details?: any) => {
        await logActivity({
            action: "create",
            resourceType,
            resourceId,
            details,
        })
    },

    update: async (resourceType: string, resourceId: string, details?: any) => {
        await logActivity({
            action: "update",
            resourceType,
            resourceId,
            details,
        })
    },

    delete: async (resourceType: string, resourceId: string, details?: any) => {
        await logActivity({
            action: "delete",
            resourceType,
            resourceId,
            details,
        })
    },

    view: async (resourceType: string, resourceId?: string, details?: any) => {
        await logActivity({
            action: "view",
            resourceType,
            resourceId,
            details,
        })
    },

    login: async (details?: any) => {
        await logActivity({
            action: "login",
            resourceType: "auth",
            details,
        })
    },

    logout: async (details?: any) => {
        await logActivity({
            action: "logout",
            resourceType: "auth",
            details,
        })
    },

    custom: async (action: string, resourceType: string, resourceId?: string, details?: any) => {
        await logActivity({
            action,
            resourceType,
            resourceId,
            details,
        })
    },
}
