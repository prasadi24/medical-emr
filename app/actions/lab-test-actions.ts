"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type LabTestCategoryFormData = {
    name: string
    description?: string
}

export type LabTestTypeFormData = {
    categoryId?: number
    name: string
    description?: string
    price: number
    preparationInstructions?: string
    resultTurnaroundTime?: string
}

export async function createLabTestCategory(formData: LabTestCategoryFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_test_categories")
            .insert({
                name: formData.name,
                description: formData.description || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create lab test category", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test category created successfully", data }
    } catch (error) {
        console.error("Error creating lab test category:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateLabTestCategory(categoryId: number, formData: LabTestCategoryFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_test_categories")
            .update({
                name: formData.name,
                description: formData.description || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", categoryId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update lab test category", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test category updated successfully", data }
    } catch (error) {
        console.error("Error updating lab test category:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteLabTestCategory(categoryId: number) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("lab_test_categories").delete().eq("id", categoryId)

        if (error) {
            return { success: false, message: "Failed to delete lab test category", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test category deleted successfully" }
    } catch (error) {
        console.error("Error deleting lab test category:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function createLabTestType(formData: LabTestTypeFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_test_types")
            .insert({
                category_id: formData.categoryId || null,
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                preparation_instructions: formData.preparationInstructions || null,
                result_turnaround_time: formData.resultTurnaroundTime || null,
            })
            .select()

        if (error) {
            return { success: false, message: "Failed to create lab test type", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test type created successfully", data }
    } catch (error) {
        console.error("Error creating lab test type:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateLabTestType(typeId: number, formData: LabTestTypeFormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_test_types")
            .update({
                category_id: formData.categoryId || null,
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                preparation_instructions: formData.preparationInstructions || null,
                result_turnaround_time: formData.resultTurnaroundTime || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", typeId)
            .select()

        if (error) {
            return { success: false, message: "Failed to update lab test type", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test type updated successfully", data }
    } catch (error) {
        console.error("Error updating lab test type:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteLabTestType(typeId: number) {
    try {
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("lab_test_types").delete().eq("id", typeId)

        if (error) {
            return { success: false, message: "Failed to delete lab test type", error }
        }

        revalidatePath("/lab-tests")
        return { success: true, message: "Lab test type deleted successfully" }
    } catch (error) {
        console.error("Error deleting lab test type:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getLabTestCategories() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("lab_test_categories").select("*").order("name", { ascending: true })

        if (error) {
            console.error("Error fetching lab test categories:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching lab test categories:", error)
        return []
    }
}

export async function getLabTestTypes(categoryId?: number) {
    try {
        const supabase = createServerSupabaseClient()

        let query = supabase
            .from("lab_test_types")
            .select(`
        *,
        category:category_id (id, name)
      `)
            .order("name", { ascending: true })

        if (categoryId) {
            query = query.eq("category_id", categoryId)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching lab test types:", error)
            return []
        }

        return data
    } catch (error) {
        console.error("Error fetching lab test types:", error)
        return []
    }
}

export async function getLabTestTypeById(typeId: number) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_test_types")
            .select(`
        *,
        category:category_id (id, name)
      `)
            .eq("id", typeId)
            .single()

        if (error) {
            console.error("Error fetching lab test type:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching lab test type:", error)
        return null
    }
}
