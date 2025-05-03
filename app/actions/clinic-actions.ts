"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ClinicFormData = {
    name: string
    address: string
    phoneNumber: string
    email?: string
    website?: string
    openingHours?: Record<string, { open: string; close: string }>
    facilities?: string[]
}

export async function createClinic(formData: ClinicFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("clinics")
            .insert({
                name: formData.name,
                address: formData.address,
                phone_number: formData.phoneNumber,
                email: formData.email || null,
                website: formData.website || null,
                opening_hours: formData.openingHours || null,
                facilities: formData.facilities || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create clinic", error }
        }

        revalidatePath("/clinics")
        return { success: true, message: "Clinic created successfully", data }
    } catch (error) {
        console.error("Error creating clinic:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateClinic(clinicId: string, formData: ClinicFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("clinics")
            .update({
                name: formData.name,
                address: formData.address,
                phone_number: formData.phoneNumber,
                email: formData.email || null,
                website: formData.website || null,
                opening_hours: formData.openingHours || null,
                facilities: formData.facilities || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", clinicId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update clinic", error }
        }

        revalidatePath("/clinics")
        revalidatePath(`/clinics/${clinicId}`)
        return { success: true, message: "Clinic updated successfully", data }
    } catch (error) {
        console.error("Error updating clinic:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteClinic(clinicId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("clinics").delete().eq("id", clinicId)

        if (error) {
            return { success: false, message: "Failed to delete clinic", error }
        }

        revalidatePath("/clinics")
        return { success: true, message: "Clinic deleted successfully" }
    } catch (error) {
        console.error("Error deleting clinic:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getClinics() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("clinics").select("*").order("name", { ascending: true })

        if (error) {
            console.error("Error fetching clinics:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching clinics:", error)
        return []
    }
}

export async function getClinicById(clinicId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("clinics").select("*").eq("id", clinicId).single()

        if (error) {
            console.error("Error fetching clinic:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching clinic:", error)
        return null
    }
}
