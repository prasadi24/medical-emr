import { createServerSupabaseClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export type AuditLogData = {
    action: string
    resourceType: string
    resourceId?: string
    details?: any
}

async function createAuditLog(data: AuditLogData) {
    try {
        const supabase = createServerSupabaseClient()
        const headersList = headers()

        // Get user info
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            console.error("Error getting user for audit log:", userError)
            return { success: false, error: userError }
        }

        // Get IP address and user agent
        const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        const { error } = await supabase.from("audit_logs").insert({
            user_id: userData.user?.id || null,
            action: data.action,
            resource_type: data.resourceType,
            resource_id: data.resourceId || null,
            details: data.details || null,
            ip_address: ipAddress,
            user_agent: userAgent,
        })

        if (error) {
            console.error("Error creating audit log:", error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error("Error creating audit log:", error)
        return { success: false, error }
    }
}

// Helper function to create a before/after comparison for updates
function createChangeLog(before: any, after: any) {
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
        await createAuditLog({
            action: "create",
            resourceType,
            resourceId,
            details,
        })
    },

    update: async (resourceType: string, resourceId: string, details?: any) => {
        await createAuditLog({
            action: "update",
            resourceType,
            resourceId,
            details,
        })
    },

    delete: async (resourceType: string, resourceId: string, details?: any) => {
        await createAuditLog({
            action: "delete",
            resourceType,
            resourceId,
            details,
        })
    },

    view: async (resourceType: string, resourceId?: string, details?: any) => {
        await createAuditLog({
            action: "view",
            resourceType,
            resourceId,
            details,
        })
    },

    login: async (details?: any) => {
        await createAuditLog({
            action: "login",
            resourceType: "auth",
            details,
        })
    },

    logout: async (details?: any) => {
        await createAuditLog({
            action: "logout",
            resourceType: "auth",
            details,
        })
    },

    custom: async (action: string, resourceType: string, resourceId?: string, details?: any) => {
        await createAuditLog({
            action,
            resourceType,
            resourceId,
            details,
        })
    },
}
