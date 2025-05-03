"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type StaffFormData = {
    userId: string
    position: string
    employmentTypeId?: number
    clinicId?: string
    department?: string
    hireDate: string
    education?: string[]
    certifications?: string[]
    languages?: string[]
}

export async function createStaff(formData: StaffFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("staff")
            .insert({
                user_id: formData.userId,
                position: formData.position,
                employment_type_id: formData.employmentTypeId || null,
                clinic_id: formData.clinicId || null,
                department: formData.department || null,
                hire_date: formData.hireDate,
                education: formData.education || null,
                certifications: formData.certifications || null,
                languages: formData.languages || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create staff profile", error }
        }

        revalidatePath("/staff")
        return { success: true, message: "Staff profile created successfully", data }
    } catch (error) {
        console.error("Error creating staff profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateStaff(staffId: string, formData: StaffFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("staff")
            .update({
                position: formData.position,
                employment_type_id: formData.employmentTypeId || null,
                clinic_id: formData.clinicId || null,
                department: formData.department || null,
                hire_date: formData.hireDate,
                education: formData.education || null,
                certifications: formData.certifications || null,
                languages: formData.languages || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", staffId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update staff profile", error }
        }

        revalidatePath("/staff")
        revalidatePath(`/staff/${staffId}`)
        return { success: true, message: "Staff profile updated successfully", data }
    } catch (error) {
        console.error("Error updating staff profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteStaff(staffId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("staff").delete().eq("id", staffId)

        if (error) {
            return { success: false, message: "Failed to delete staff profile", error }
        }

        revalidatePath("/staff")
        return { success: true, message: "Staff profile deleted successfully" }
    } catch (error) {
        console.error("Error deleting staff profile:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getStaff() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("staff")
            .select(`
        *,
        user:user_id (email),
        employment_type:employment_type_id (name),
        clinic:clinic_id (name)
      `)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching staff:", error)
            return []
        }

        // Get user profiles for each staff member
        const userIds = data.map((staff) => staff.user_id)
        const { data: profiles } = await supabase.from("user_profiles").select("*").in("id", userIds)

        // Combine staff data with user profile data
        const staffWithProfiles = data.map((staff) => {
            const profile = profiles?.find((p) => p.id === staff.user_id) || {}
            return {
                ...staff,
                profile,
            }
        })

        return staffWithProfiles
    } catch (error) {
        console.error("Error fetching staff:", error)
        return []
    }
}

export async function getStaffById(staffId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("staff")
            .select(`
        *,
        user:user_id (email),
        employment_type:employment_type_id (name),
        clinic:clinic_id (name)
      `)
            .eq("id", staffId)
            .single()

        if (error) {
            console.error("Error fetching staff:", error)
            return null
        }

        // Get user profile
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user_id).single()

        return {
            ...data,
            profile,
        }
    } catch (error) {
        console.error("Error fetching staff:", error)
        return null
    }
}
