"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type VitalsFormData = {
    medicalRecordId: string
    temperature?: number
    heartRate?: number
    respiratoryRate?: number
    bloodPressureSystolic?: number
    bloodPressureDiastolic?: number
    oxygenSaturation?: number
    height?: number
    weight?: number
    notes?: string
}

export async function createVitals(formData: VitalsFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const { data, error } = await supabase
            .from("vitals")
            .insert({
                medical_record_id: formData.medicalRecordId,
                recorded_by: userData.user.id,
                temperature: formData.temperature || null,
                heart_rate: formData.heartRate || null,
                respiratory_rate: formData.respiratoryRate || null,
                blood_pressure_systolic: formData.bloodPressureSystolic || null,
                blood_pressure_diastolic: formData.bloodPressureDiastolic || null,
                oxygen_saturation: formData.oxygenSaturation || null,
                height: formData.height || null,
                weight: formData.weight || null,
                notes: formData.notes || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to record vitals", error }
        }

        revalidatePath(`/medical-records/${formData.medicalRecordId}`)
        return { success: true, message: "Vitals recorded successfully", data }
    } catch (error) {
        console.error("Error recording vitals:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateVitals(vitalsId: string, formData: VitalsFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("vitals")
            .update({
                temperature: formData.temperature || null,
                heart_rate: formData.heartRate || null,
                respiratory_rate: formData.respiratoryRate || null,
                blood_pressure_systolic: formData.bloodPressureSystolic || null,
                blood_pressure_diastolic: formData.bloodPressureDiastolic || null,
                oxygen_saturation: formData.oxygenSaturation || null,
                height: formData.height || null,
                weight: formData.weight || null,
                notes: formData.notes || null,
            })
            .eq("id", vitalsId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update vitals", error }
        }

        revalidatePath(`/medical-records/${formData.medicalRecordId}`)
        return { success: true, message: "Vitals updated successfully", data }
    } catch (error) {
        console.error("Error updating vitals:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getVitalsByMedicalRecordId(medicalRecordId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("vitals")
            .select("*, recorder:recorded_by (email)")
            .eq("medical_record_id", medicalRecordId)
            .order("recorded_at", { ascending: false })

        if (error) {
            console.error("Error fetching vitals:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching vitals:", error)
        return []
    }
}
