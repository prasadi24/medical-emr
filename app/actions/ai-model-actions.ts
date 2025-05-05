"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auditLogger } from "@/lib/audit-logger"

export async function seedAIModels() {
    try {
        const supabase = createServerSupabaseClient()

        // Get user info for audit logging
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Check if models already exist
        const { data: existingModels, error: checkError } = await supabase
            .from("ai_models")
            .select("id")
            .limit(1)

        if (checkError) {
            console.error("Error checking existing models:", checkError)
            return { success: false, message: "Failed to check existing models", error: checkError }
        }

        // If models already exist, don't seed again
        if (existingModels && existingModels.length > 0) {
            return { success: true, message: "AI models already seeded", data: existingModels }
        }

        // Define initial AI models
        const initialModels = [
            {
                name: "Clinical Text Analysis",
                description: "Analyzes clinical notes to extract structured data and provide insights",
                model_type: "text_analysis",
                provider: "openai",
                config: {
                    model: "gpt-4o",
                    temperature: 0.3,
                    max_tokens: 1000
                },
                is_active: true
            },
            {
                name: "Diagnostic Assistant",
                description: "Suggests potential diagnoses based on symptoms and patient history",
                model_type: "diagnostic",
                provider: "openai",
                config: {
                    model: "gpt-4o",
                    temperature: 0.2,
                    max_tokens: 800
                },
                is_active: true
            },
            {
                name: "Treatment Planner",
                description: "Recommends evidence-based treatment plans for specific diagnoses",
                model_type: "treatment",
                provider: "openai",
                config: {
                    model: "gpt-4o",
                    temperature: 0.4,
                    max_tokens: 1200
                },
                is_active: true
            },
            {
                name: "Patient Communication",
                description: "Generates patient-friendly explanations and educational content",
                model_type: "communication",
                provider: "openai",
                config: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    max_tokens: 1500
                },
                is_active: true
            },
            {
                name: "Medical Documentation",
                description: "Generates and formats medical documentation from clinical notes",
                model_type: "documentation",
                provider: "openai",
                config: {
                    model: "gpt-4o",
                    temperature: 0.3,
                    max_tokens: 2000
                },
                is_active: true
            }
        ]

        // Insert models into the database
        const { data, error } = await supabase
            .from("ai_models")
            .insert(initialModels)
            .select()

        if (error) {
            console.error("Error seeding AI models:", error)
            return { success: false, message: "Failed to seed AI models", error }
        }

        // Log the action
        await auditLogger.create("ai_models", "all", {
            actionType: "seed_ai_models",
            userId: userData.user.id,
            details: "Initial AI models configuration"
        })

        revalidatePath("/admin/ai-settings")

        return { success: true, message: "AI models seeded successfully", data }
    } catch (error) {
        console.error("Error in seedAIModels:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getAIModels() {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("ai_models")
            .select("*")
            .order("id", { ascending: true })

        if (error) {
            console.error("Error fetching AI models:", error)
            return { success: false, message: "Failed to fetch AI models", error }
        }

        return { success: true, data }
    } catch (error) {
        console.error("Error in getAIModels:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateAIModel(id: number, updates: any) {
    try {
        const supabase = createServerSupabaseClient()

        // Get user info for audit logging
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Update the model
        const { data, error } = await supabase
            .from("ai_models")
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()

        if (error) {
            console.error("Error updating AI model:", error)
            return { success: false, message: "Failed to update AI model", error }
        }

        // Log the action
        await auditLogger.create("ai_models", id.toString(), {
            actionType: "update_ai_model",
            userId: userData.user.id,
            details: `Updated AI model: ${updates.name || id}`
        })

        revalidatePath("/admin/ai-settings")

        return { success: true, message: "AI model updated successfully", data }
    } catch (error) {
        console.error("Error in updateAIModel:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}
