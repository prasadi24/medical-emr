"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type AppointmentFormData = {
    patientId: string
    doctorId: string
    clinicId: string
    appointmentDate: string
    duration?: number
    status?: string
    type?: string
    reason?: string
    notes?: string
}

export async function createAppointment(formData: AppointmentFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("appointments")
            .insert({
                patient_id: formData.patientId,
                doctor_id: formData.doctorId,
                clinic_id: formData.clinicId,
                appointment_date: formData.appointmentDate,
                duration: formData.duration || 30,
                status: formData.status || "scheduled",
                type: formData.type || "consultation",
                reason: formData.reason || null,
                notes: formData.notes || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create appointment", error }
        }

        revalidatePath("/appointments")
        revalidatePath(`/patients/${formData.patientId}`)
        return { success: true, message: "Appointment created successfully", data }
    } catch (error) {
        console.error("Error creating appointment:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateAppointment(appointmentId: string, formData: AppointmentFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("appointments")
            .update({
                patient_id: formData.patientId,
                doctor_id: formData.doctorId,
                clinic_id: formData.clinicId,
                appointment_date: formData.appointmentDate,
                duration: formData.duration || 30,
                status: formData.status || "scheduled",
                type: formData.type || "consultation",
                reason: formData.reason || null,
                notes: formData.notes || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", appointmentId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update appointment", error }
        }

        revalidatePath("/appointments")
        revalidatePath(`/appointments/${appointmentId}`)
        revalidatePath(`/patients/${formData.patientId}`)
        return { success: true, message: "Appointment updated successfully", data }
    } catch (error) {
        console.error("Error updating appointment:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteAppointment(appointmentId: string, patientId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("appointments").delete().eq("id", appointmentId)

        if (error) {
            return { success: false, message: "Failed to delete appointment", error }
        }

        revalidatePath("/appointments")
        revalidatePath(`/patients/${patientId}`)
        return { success: true, message: "Appointment deleted successfully" }
    } catch (error) {
        console.error("Error deleting appointment:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getAppointments(filters?: {
    patientId?: string
    doctorId?: string
    clinicId?: string
    startDate?: string
    endDate?: string
    status?: string
}) {
    try {
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from("appointments")
            .select(`
        *,
        patient:patient_id (id, first_name, last_name),
        doctor:doctor_id (
          id, 
          user_id,
          user:user_id (email),
          specialty:specialty_id (name)
        ),
        clinic:clinic_id (id, name)
      `)
            .order("appointment_date", { ascending: true })

        if (filters?.patientId) {
            query = query.eq("patient_id", filters.patientId)
        }

        if (filters?.doctorId) {
            query = query.eq("doctor_id", filters.doctorId)
        }

        if (filters?.clinicId) {
            query = query.eq("clinic_id", filters.clinicId)
        }

        if (filters?.status) {
            query = query.eq("status", filters.status)
        }

        if (filters?.startDate) {
            query = query.gte("appointment_date", filters.startDate)
        }

        if (filters?.endDate) {
            query = query.lte("appointment_date", filters.endDate)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching appointments:", error)
            return []
        }

        // Get user profiles for each doctor to get their names
        const userIds = data.map((appointment) => appointment.doctor?.user_id).filter(Boolean)
        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from("user_profiles").select("*").in("id", userIds)

            // Combine appointment data with user profile data
            return data.map((appointment) => {
                const profile = profiles?.find((p) => p.id === appointment.doctor?.user_id) || {}
                return {
                    ...appointment,
                    doctor: {
                        ...appointment.doctor,
                        profile,
                    },
                }
            })
        }

        return data
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return []
    }
}

export async function getAppointmentById(appointmentId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("appointments")
            .select(`
        *,
        patient:patient_id (id, first_name, last_name, email, phone_number),
        doctor:doctor_id (
          id, 
          user_id,
          user:user_id (email),
          specialty:specialty_id (name)
        ),
        clinic:clinic_id (id, name, address, phone_number)
      `)
            .eq("id", appointmentId)
            .single()

        if (error) {
            console.error("Error fetching appointment:", error)
            return null
        }

        // Get user profile for the doctor
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.doctor?.user_id).single()

        return {
            ...data,
            doctor: {
                ...data.doctor,
                profile,
            },
        }
    } catch (error) {
        console.error("Error fetching appointment:", error)
        return null
    }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("appointments")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", appointmentId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update appointment status", error }
        }

        revalidatePath("/appointments")
        revalidatePath(`/appointments/${appointmentId}`)
        if (data && data[0]) {
            revalidatePath(`/patients/${data[0].patient_id}`)
        }
        return { success: true, message: "Appointment status updated successfully", data }
    } catch (error) {
        console.error("Error updating appointment status:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}
