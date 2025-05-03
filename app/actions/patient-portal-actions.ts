"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { auditLogger } from "@/lib/audit-logger"

export async function getPatientMessages(params: {
    patientId: string
    limit?: number
    offset?: number
    unreadOnly?: boolean
}) {
    const { patientId, limit = 10, offset = 0, unreadOnly = false } = params
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from("patient_messages")
        .select(
            `
      *,
      staff:staff_id (
        position,
        user_profiles:user_id (
          first_name,
          last_name
        )
      ),
      doctor:doctor_id (
        user_profiles:user_id (
          first_name,
          last_name
        )
      ),
      patient:patient_id (
        first_name,
        last_name
      ),
      replies:patient_messages!parent_message_id (
        id,
        sender_type,
        message,
        created_at
      )
    `,
            { count: "exact" },
        )
        .eq("patient_id", patientId)
        .is("parent_message_id", null) // Only get parent messages
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

    if (unreadOnly) {
        query = query.eq("is_read", false)
    }

    const { data: messages, error, count } = await query

    if (error) {
        console.error("Error fetching patient messages:", error)
        throw new Error(`Failed to fetch patient messages: ${error.message}`)
    }

    await auditLogger.view("patient_messages", undefined, { patientId, unreadOnly })

    return { messages, count }
}

export async function getMessageById(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: message, error } = await supabase
        .from("patient_messages")
        .select(`
      *,
      staff:staff_id (
        position,
        user_profiles:user_id (
          first_name,
          last_name
        )
      ),
      doctor:doctor_id (
        user_profiles:user_id (
          first_name,
          last_name
        )
      ),
      patient:patient_id (
        first_name,
        last_name
      ),
      replies:patient_messages!parent_message_id (
        id,
        sender_type,
        message,
        created_at,
        staff:staff_id (
          position,
          user_profiles:user_id (
            first_name,
            last_name
          )
        ),
        doctor:doctor_id (
          user_profiles:user_id (
            first_name,
            last_name
          )
        )
      )
    `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching message:", error)
        throw new Error(`Failed to fetch message: ${error.message}`)
    }

    await auditLogger.view("patient_messages", id)

    return message
}

export async function createMessage(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to send a message")
    }

    const patientId = formData.get("patientId") as string
    const staffId = (formData.get("staffId") as string) || null
    const doctorId = (formData.get("doctorId") as string) || null
    const senderType = formData.get("senderType") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string
    const parentMessageId = (formData.get("parentMessageId") as string) || null

    const messageData = {
        id: uuidv4(),
        patient_id: patientId,
        staff_id: staffId,
        doctor_id: doctorId,
        sender_type: senderType,
        subject: parentMessageId ? "" : subject, // Only parent messages have subjects
        message,
        parent_message_id: parentMessageId,
    }

    const { data, error } = await supabase.from("patient_messages").insert(messageData).select()

    if (error) {
        console.error("Error creating message:", error)
        throw new Error(`Failed to create message: ${error.message}`)
    }

    await auditLogger.create("patient_messages", messageData.id, {
        patientId,
        staffId,
        doctorId,
        senderType,
        parentMessageId,
    })

    // Create notification for the recipient
    if (senderType === "patient") {
        // Notify staff/doctor
        const notificationData = {
            id: uuidv4(),
            patient_id: patientId,
            title: "New Message",
            message: `New message from patient: ${subject || "Reply to message"}`,
            type: "message",
            reference_id: messageData.id,
            reference_type: "patient_messages",
        }

        await supabase.from("patient_notifications").insert(notificationData)
    } else {
        // Notify patient
        const notificationData = {
            id: uuidv4(),
            patient_id: patientId,
            title: "New Message",
            message: `New message from ${senderType}: ${subject || "Reply to message"}`,
            type: "message",
            reference_id: messageData.id,
            reference_type: "patient_messages",
        }

        await supabase.from("patient_notifications").insert(notificationData)
    }

    if (parentMessageId) {
        revalidatePath(`/messages/${parentMessageId}`)
        redirect(`/messages/${parentMessageId}`)
    } else {
        revalidatePath("/messages")
        redirect("/messages")
    }
}

export async function markMessageAsRead(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update a message")
    }

    const { error } = await supabase
        .from("patient_messages")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", id)

    if (error) {
        console.error("Error marking message as read:", error)
        throw new Error(`Failed to mark message as read: ${error.message}`)
    }

    await auditLogger.update("patient_messages", id, { is_read: true })

    revalidatePath(`/messages/${id}`)
}

export async function getPatientNotifications(params: {
    patientId: string
    limit?: number
    offset?: number
    unreadOnly?: boolean
}) {
    const { patientId, limit = 10, offset = 0, unreadOnly = false } = params
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from("patient_notifications")
        .select("*", { count: "exact" })
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

    if (unreadOnly) {
        query = query.eq("is_read", false)
    }

    const { data: notifications, error, count } = await query

    if (error) {
        console.error("Error fetching patient notifications:", error)
        throw new Error(`Failed to fetch patient notifications: ${error.message}`)
    }

    await auditLogger.view("patient_notifications", undefined, { patientId, unreadOnly })

    return { notifications, count }
}

export async function markNotificationAsRead(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update a notification")
    }

    const { error } = await supabase
        .from("patient_notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", id)

    if (error) {
        console.error("Error marking notification as read:", error)
        throw new Error(`Failed to mark notification as read: ${error.message}`)
    }

    await auditLogger.update("patient_notifications", id, { is_read: true })

    revalidatePath("/notifications")
}

export async function getPatientPreferences(patientId: string) {
    const supabase = createServerSupabaseClient()

    const { data: preferences, error } = await supabase
        .from("patient_preferences")
        .select("*")
        .eq("patient_id", patientId)
        .single()

    if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error fetching patient preferences:", error)
        throw new Error(`Failed to fetch patient preferences: ${error.message}`)
    }

    // If no preferences exist, create default preferences
    if (!preferences) {
        const defaultPreferences = {
            patient_id: patientId,
            notification_preferences: {
                email: true,
                sms: false,
                push: false,
            },
            portal_theme: "light",
            language_preference: "en",
            time_zone: "UTC",
        }

        const { data: newPreferences, error: insertError } = await supabase
            .from("patient_preferences")
            .insert(defaultPreferences)
            .select()
            .single()

        if (insertError) {
            console.error("Error creating default patient preferences:", insertError)
            throw new Error(`Failed to create default patient preferences: ${insertError.message}`)
        }

        return newPreferences
    }

    return preferences
}

export async function updatePatientPreferences(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update preferences")
    }

    const patientId = formData.get("patientId") as string
    const emailNotifications = formData.get("emailNotifications") === "on"
    const smsNotifications = formData.get("smsNotifications") === "on"
    const pushNotifications = formData.get("pushNotifications") === "on"
    const portalTheme = formData.get("portalTheme") as string
    const languagePreference = formData.get("languagePreference") as string
    const timeZone = formData.get("timeZone") as string

    const preferencesData = {
        notification_preferences: {
            email: emailNotifications,
            sms: smsNotifications,
            push: pushNotifications,
        },
        portal_theme: portalTheme,
        language_preference: languagePreference,
        time_zone: timeZone,
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("patient_preferences").update(preferencesData).eq("patient_id", patientId)

    if (error) {
        console.error("Error updating patient preferences:", error)
        throw new Error(`Failed to update patient preferences: ${error.message}`)
    }

    await auditLogger.update("patient_preferences", patientId, preferencesData)

    revalidatePath(`/patients/${patientId}/preferences`)
    redirect(`/patients/${patientId}/preferences`)
}
