"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type PatientFormData = {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType?: string
    address?: string
    phoneNumber?: string
    email?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    insuranceProvider?: string
    insurancePolicyNumber?: string
}

export async function createPatient(formData: PatientFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const { data, error } = await supabase
            .from("patients")
            .insert({
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                blood_type: formData.bloodType || null,
                address: formData.address || null,
                phone_number: formData.phoneNumber || null,
                email: formData.email || null,
                emergency_contact_name: formData.emergencyContactName || null,
                emergency_contact_phone: formData.emergencyContactPhone || null,
                insurance_provider: formData.insuranceProvider || null,
                insurance_policy_number: formData.insurancePolicyNumber || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create patient", error }
        }

        revalidatePath("/patients")
        return { success: true, message: "Patient created successfully", data }
    } catch (error) {
        console.error("Error creating patient:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updatePatient(patientId: string, formData: PatientFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("patients")
            .update({
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                blood_type: formData.bloodType || null,
                address: formData.address || null,
                phone_number: formData.phoneNumber || null,
                email: formData.email || null,
                emergency_contact_name: formData.emergencyContactName || null,
                emergency_contact_phone: formData.emergencyContactPhone || null,
                insurance_provider: formData.insuranceProvider || null,
                insurance_policy_number: formData.insurancePolicyNumber || null,
            })
            .eq("id", patientId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update patient", error }
        }

        revalidatePath("/patients")
        revalidatePath(`/patients/${patientId}`)
        return { success: true, message: "Patient updated successfully", data }
    } catch (error) {
        console.error("Error updating patient:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deletePatient(patientId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("patients").delete().eq("id", patientId)

        if (error) {
            return { success: false, message: "Failed to delete patient", error }
        }

        revalidatePath("/patients")
        return { success: true, message: "Patient deleted successfully" }
    } catch (error) {
        console.error("Error deleting patient:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getPatients() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("patients").select("*").order("last_name", { ascending: true })

        if (error) {
            console.error("Error fetching patients:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching patients:", error)
        return []
    }
}

export async function getPatientById(patientId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("patients").select("*").eq("id", patientId).single()

        if (error) {
            console.error("Error fetching patient:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching patient:", error)
        return null
    }
}
