"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logActivity, createChangeLog } from "@/lib/audit-logger"

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

        const patientData = {
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
        }

        const { data, error } = await supabase.from("patients").insert(patientData).select()

        if (error) {
            return { success: false, message: "Failed to create patient", error }
        }

        // Log the activity
        await logActivity({
            action: "create",
            resourceType: "patient",
            resourceId: data[0].id,
            details: {
                patientName: `${formData.firstName} ${formData.lastName}`,
                createdBy: userData.user.id,
                data: patientData,
            },
        })

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

        // Get current patient data for audit log
        const { data: currentPatient } = await supabase.from("patients").select("*").eq("id", patientId).single()

        const updatedData = {
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
        }

        const { data, error } = await supabase.from("patients").update(updatedData).eq("id", patientId).select()

        if (error) {
            return { success: false, message: "Failed to update patient", error }
        }

        // Create change log for audit
        const changes = createChangeLog(currentPatient, updatedData)

        // Log the activity
        await logActivity({
            action: "update",
            resourceType: "patient",
            resourceId: patientId,
            details: {
                patientName: `${formData.firstName} ${formData.lastName}`,
                changes,
            },
        })

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

        // Get patient data for audit log before deletion
        const { data: patient } = await supabase.from("patients").select("*").eq("id", patientId).single()

        const { error } = await supabase.from("patients").delete().eq("id", patientId)

        if (error) {
            return { success: false, message: "Failed to delete patient", error }
        }

        // Log the activity
        await logActivity({
            action: "delete",
            resourceType: "patient",
            resourceId: patientId,
            details: {
                patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
                deletedData: patient,
            },
        })

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

        // Log the view activity
        await logActivity({
            action: "view",
            resourceType: "patient",
            resourceId: patientId,
            details: {
                patientName: `${data.first_name} ${data.last_name}`,
            },
        })

        return data
    } catch (error) {
        console.error("Error fetching patient:", error)
        return null
    }
}
