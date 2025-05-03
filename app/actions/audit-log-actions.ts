"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export type AuditLogData = {
    action: string
    resourceType: string
    resourceId?: string
    details?: any
}

export async function createAuditLog(data: AuditLogData) {
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

export async function getAuditLogs(filters?: {
    userId?: string
    action?: string
    resourceType?: string
    resourceId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
}) {
    try {
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from("audit_logs")
            .select(`
        *,
        user:user_id (email)
      `)
            .order("created_at", { ascending: false })

        if (filters?.userId) {
            query = query.eq("user_id", filters.userId)
        }

        if (filters?.action) {
            query = query.eq("action", filters.action)
        }

        if (filters?.resourceType) {
            query = query.eq("resource_type", filters.resourceType)
        }

        if (filters?.resourceId) {
            query = query.eq("resource_id", filters.resourceId)
        }

        if (filters?.startDate) {
            query = query.gte("created_at", filters.startDate)
        }

        if (filters?.endDate) {
            query = query.lte("created_at", filters.endDate)
        }

        if (filters?.limit) {
            query = query.limit(filters.limit)
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
        }

        const { data, error, count } = await query.returns<any[]>()

        if (error) {
            console.error("Error fetching audit logs:", error)
            return { data: [], count: 0 }
        }

        // Get user profiles for each log entry
        const userIds = data
            .map((log) => log.user_id)
            .filter(Boolean)
            .filter((id, index, self) => self.indexOf(id) === index) // Get unique IDs

        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from("user_profiles").select("*").in("id", userIds)

            // Combine log data with user profile data
            const logsWithProfiles = data.map((log) => {
                const profile = profiles?.find((p) => p.id === log.user_id) || {}
                return {
                    ...log,
                    userProfile: profile,
                }
            })

            return { data: logsWithProfiles, count }
        }

        return { data, count }
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        return { data: [], count: 0 }
    }
}

export async function getAuditLogById(logId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("audit_logs")
            .select(`
        *,
        user:user_id (email)
      `)
            .eq("id", logId)
            .single()

        if (error) {
            console.error("Error fetching audit log:", error)
            return null
        }

        // Get user profile if user_id exists
        if (data.user_id) {
            const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user_id).single()

            return {
                ...data,
                userProfile: profile || {},
            }
        }

        return data
    } catch (error) {
        console.error("Error fetching audit log:", error)
        return null
    }
}

// Helper function to get resource name based on ID
export async function getResourceName(resourceType: string, resourceId: string) {
    try {
        const supabase = createServerSupabaseClient()

        switch (resourceType) {
            case "patient":
                const { data: patient } = await supabase
                    .from("patients")
                    .select("first_name, last_name")
                    .eq("id", resourceId)
                    .single()
                return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"

            case "doctor":
                const { data: doctor } = await supabase.from("doctors").select("user_id").eq("id", resourceId).single()

                if (doctor) {
                    const { data: profile } = await supabase
                        .from("user_profiles")
                        .select("first_name, last_name")
                        .eq("id", doctor.user_id)
                        .single()
                    return profile ? `Dr. ${profile.first_name} ${profile.last_name}` : "Unknown Doctor"
                }
                return "Unknown Doctor"

            case "appointment":
                const { data: appointment } = await supabase.from("appointments").select("id").eq("id", resourceId).single()
                return appointment ? `Appointment #${appointment.id.substring(0, 8)}` : "Unknown Appointment"

            case "clinic":
                const { data: clinic } = await supabase.from("clinics").select("name").eq("id", resourceId).single()
                return clinic ? clinic.name : "Unknown Clinic"

            default:
                return `${resourceType} #${resourceId.substring(0, 8)}`
        }
    } catch (error) {
        console.error(`Error getting resource name for ${resourceType} ${resourceId}:`, error)
        return `${resourceType} #${resourceId.substring(0, 8)}`
    }
}
