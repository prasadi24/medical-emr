"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MedicalRecordFormData = {
    patientId: string
    chiefComplaint: string
    diagnosis?: string
    treatmentPlan?: string
    notes?: string
    followUpDate?: string
}

export async function createMedicalRecord(formData: MedicalRecordFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const { data, error } = await supabase
            .from("medical_records")
            .insert({
                patient_id: formData.patientId,
                doctor_id: userData.user.id,
                chief_complaint: formData.chiefComplaint,
                diagnosis: formData.diagnosis || null,
                treatment_plan: formData.treatmentPlan || null,
                notes: formData.notes || null,
                follow_up_date: formData.followUpDate || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create medical record", error }
        }

        revalidatePath(`/patients/${formData.patientId}`)
        revalidatePath("/medical-records")
        return { success: true, message: "Medical record created successfully", data }
    } catch (error) {
        console.error("Error creating medical record:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateMedicalRecord(recordId: string, formData: MedicalRecordFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("medical_records")
            .update({
                chief_complaint: formData.chiefComplaint,
                diagnosis: formData.diagnosis || null,
                treatment_plan: formData.treatmentPlan || null,
                notes: formData.notes || null,
                follow_up_date: formData.followUpDate || null,
            })
            .eq("id", recordId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update medical record", error }
        }

        revalidatePath(`/patients/${formData.patientId}`)
        revalidatePath(`/medical-records/${recordId}`)
        revalidatePath("/medical-records")
        return { success: true, message: "Medical record updated successfully", data }
    } catch (error) {
        console.error("Error updating medical record:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteMedicalRecord(recordId: string, patientId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("medical_records").delete().eq("id", recordId)

        if (error) {
            return { success: false, message: "Failed to delete medical record", error }
        }

        revalidatePath(`/patients/${patientId}`)
        revalidatePath("/medical-records")
        return { success: true, message: "Medical record deleted successfully" }
    } catch (error) {
        console.error("Error deleting medical record:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getMedicalRecords(params: { patientId: string }) {
    try {
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from("medical_records")
            .select(`
        *,
        patients (id, first_name, last_name),
        doctor:doctor_id (email)
      `)
            .order("visit_date", { ascending: false })

        if (params.patientId) {
            query = query.eq("patient_id", params.patientId)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching medical records:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching medical records:", error)
        return []
    }
}

export async function getMedicalRecordById(recordId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("medical_records")
            .select(`
        *,
        patients (id, first_name, last_name),
        doctor:doctor_id (email),
        vitals (*)
      `)
            .eq("id", recordId)
            .single()

        if (error) {
            console.error("Error fetching medical record:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching medical record:", error)
        return null
    }
}
