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

// This is the original function signature to maintain backward compatibility
export async function getDoctors(options = { page: 1, limit: 100, search: "" }) {
    try {
        const supabase = createServerSupabaseClient()
        const { page = 1, limit = 100, search = "" } = options
        const offset = (page - 1) * limit

        let query = supabase.from("doctors").select(
            `
        *,
        user_profiles (
          first_name,
          last_name,
          email,
          phone
        ),
        specialties (
          name
        )
      `,
            { count: "exact" },
        )

        if (search) {
            query = query.or(
                `user_profiles.first_name.ilike.%${search}%,user_profiles.last_name.ilike.%${search}%,license_number.ilike.%${search}%`,
            )
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            throw error
        }

        // For backward compatibility, return the array directly
        return data || []
    } catch (error) {
        console.error("Error fetching doctors:", error)
        return []
    }
}

export async function getDoctorsWithPagination(options = { page: 1, limit: 10, search: "" }) {
    try {
        const supabase = createServerSupabaseClient()
        const { page = 1, limit = 10, search = "" } = options
        const offset = (page - 1) * limit

        let query = supabase.from("doctors").select(
            `
        *,
        user_profiles (
          first_name,
          last_name,
          email,
          phone
        ),
        specialties (
          name
        )
      `,
            { count: "exact" },
        )

        if (search) {
            query = query.or(
                `user_profiles.first_name.ilike.%${search}%,user_profiles.last_name.ilike.%${search}%,license_number.ilike.%${search}%`,
            )
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            throw error
        }

        return {
            doctors: data || [],
            totalCount: count || 0,
            page,
            limit,
        }
    } catch (error) {
        console.error("Error fetching doctors:", error)
        throw error
    }
}

export async function getDoctorById(id: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .select(
                `
        *,
        user_profiles (
          first_name,
          last_name,
          email,
          phone
        ),
        specialties (
          name
        )
      `,
            )
            .eq("id", id)
            .single()

        if (error) {
            throw error
        }

        return data
    } catch (error) {
        console.error("Error fetching doctor:", error)
        throw error
    }
}

export async function getDoctorByUserId(userId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("doctors")
            .select(
                `
        *,
        user_profiles (
          first_name,
          last_name,
          email,
          phone
        ),
        specialties (
          name
        )
      `,
            )
            .eq("user_id", userId)
            .single()

        if (error) {
            throw error
        }

        return data
    } catch (error) {
        console.error("Error fetching doctor by user ID:", error)
        throw error
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
