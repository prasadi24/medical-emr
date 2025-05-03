"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type DoctorFormData = {
    userId: string
    specialtyId?: number
    licenseNumber: string
    employmentTypeId?: number
    clinicId?: string
    consultationFee?: number
    education?: string[]
    experience?: number
    bio?: string
    languages?: string[]
    availableDays?: string[]
    availableHours?: Record<string, { start: string; end: string }[]>
}

export async function createDoctor(formData: DoctorFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .insert({
                user_id: formData.userId,
                specialty_id: formData.specialtyId || null,
                license_number: formData.licenseNumber,
                employment_type_id: formData.employmentTypeId || null,
                clinic_id: formData.clinicId || null,
                consultation_fee: formData.consultationFee || null,
                education: formData.education || null,
                experience: formData.experience || null,
                bio: formData.bio || null,
                languages: formData.languages || null,
                available_days: formData.availableDays || null,
                available_hours: formData.availableHours || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create doctor profile", error }
        }

        revalidatePath("/doctors")
        return { success: true, message: "Doctor profile created successfully", data }
    } catch (error) {
        console.error("Error creating doctor profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateDoctor(doctorId: string, formData: DoctorFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .update({
                specialty_id: formData.specialtyId || null,
                license_number: formData.licenseNumber,
                employment_type_id: formData.employmentTypeId || null,
                clinic_id: formData.clinicId || null,
                consultation_fee: formData.consultationFee || null,
                education: formData.education || null,
                experience: formData.experience || null,
                bio: formData.bio || null,
                languages: formData.languages || null,
                available_days: formData.availableDays || null,
                available_hours: formData.availableHours || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", doctorId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update doctor profile", error }
        }

        revalidatePath("/doctors")
        revalidatePath(`/doctors/${doctorId}`)
        return { success: true, message: "Doctor profile updated successfully", data }
    } catch (error) {
        console.error("Error updating doctor profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteDoctor(doctorId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("doctors").delete().eq("id", doctorId)

        if (error) {
            return { success: false, message: "Failed to delete doctor profile", error }
        }

        revalidatePath("/doctors")
        return { success: true, message: "Doctor profile deleted successfully" }
    } catch (error) {
        console.error("Error deleting doctor profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getDoctors() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .select(`
        *,
        user:user_id (email),
        specialty:specialty_id (name),
        employment_type:employment_type_id (name),
        clinic:clinic_id (name)
      `)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching doctors:", error)
            return []
        }

        // Get user profiles for each doctor
        const userIds = data.map((doctor) => doctor.user_id)
        const { data: profiles } = await supabase.from("user_profiles").select("*").in("id", userIds)

        // Combine doctor data with user profile data
        const doctorsWithProfiles = data.map((doctor) => {
            const profile = profiles?.find((p) => p.id === doctor.user_id) || {}
            return {
                ...doctor,
                profile,
            }
        })

        return doctorsWithProfiles
    } catch (error) {
        console.error("Error fetching doctors:", error)
        return []
    }
}

export async function getDoctorById(doctorId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .select(`
        *,
        user:user_id (email),
        specialty:specialty_id (name),
        employment_type:employment_type_id (name),
        clinic:clinic_id (name)
      `)
            .eq("id", doctorId)
            .single()

        if (error) {
            console.error("Error fetching doctor:", error)
            return null
        }

        // Get user profile
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user_id).single()

        return {
            ...data,
            profile,
        }
    } catch (error) {
        console.error("Error fetching doctor:", error)
        return null
    }
}

export async function getSpecialties() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("specialties").select("*").order("name", { ascending: true })

        if (error) {
            console.error("Error fetching specialties:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching specialties:", error)
        return []
    }
}

export async function getEmploymentTypes() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("employment_types").select("*").order("name", { ascending: true })

        if (error) {
            console.error("Error fetching employment types:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching employment types:", error)
        return []
    }
}
