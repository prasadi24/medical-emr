"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { assignRoleToUser, removeRoleFromUser, type UserRole } from "@/lib/role-management"
import { revalidatePath } from "next/cache"

/**
 * Create a new user with a specific role
 */
export async function createUser(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const roleName = formData.get("role") as string

    if (!email || !password || !firstName || !lastName || !roleName) {
        return { success: false, message: "All fields are required" }
    }

    try {
        const supabase = createServerSupabaseClient()

        // Create the user
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (error) {
            return { success: false, message: error.message }
        }

        // Create user profile
        const { error: profileError } = await supabase.from("user_profiles").insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
        })

        if (profileError) {
            return { success: false, message: profileError.message }
        }

        // Assign role
        const roleAssigned = await assignRoleToUser(data.user.id, roleName)

        if (!roleAssigned) {
            return { success: false, message: "Failed to assign role" }
        }

        revalidatePath("/users")
        return { success: true, message: "User created successfully" }
    } catch (error) {
        console.error("Error creating user:", error)
        return { success: false, message: "An unexpected error occurred" }
    }
}

/**
 * Update a user's role
 */
export async function updateUserRole(formData: FormData) {
    const userId = formData.get("userId") as string
    const currentRole = formData.get("currentRole") as string
    const newRole = formData.get("newRole") as string

    if (!userId || !currentRole || !newRole) {
        return { success: false, message: "All fields are required" }
    }

    try {
        // Remove current role
        const roleRemoved = await removeRoleFromUser(userId, currentRole)

        if (!roleRemoved) {
            return { success: false, message: "Failed to remove current role" }
        }

        // Assign new role
        const roleAssigned = await assignRoleToUser(userId, newRole)

        if (!roleAssigned) {
            // Try to restore the old role if new role assignment fails
            await assignRoleToUser(userId, currentRole)
            return { success: false, message: "Failed to assign new role" }
        }

        revalidatePath("/users")
        return { success: true, message: "User role updated successfully" }
    } catch (error) {
        console.error("Error updating user role:", error)
        return { success: false, message: "An unexpected error occurred" }
    }
}

// Fix the getAllUsers function to properly format the roles
export async function getAllUsers() {
    try {
        const supabase = createServerSupabaseClient()

        // Get all users from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
            console.error("Error fetching users:", authError)
            return []
        }

        // Get user profiles
        const { data: profiles, error: profileError } = await supabase.from("user_profiles").select("*")

        if (profileError) {
            console.error("Error fetching profiles:", profileError)
            return []
        }

        // Get user roles with role details
        const { data: userRolesData, error: rolesError } = await supabase
            .from("user_roles")
            .select("user_id, roles(id, name, description)")

        if (rolesError) {
            console.error("Error fetching user roles:", rolesError)
            return []
        }

        // Group roles by user_id
        const userRolesMap: Record<string, UserRole[]> = {}
        userRolesData.forEach((ur) => {
            if (!userRolesMap[ur.user_id]) {
                userRolesMap[ur.user_id] = []
            }
            userRolesMap[ur.user_id].push(ur.roles as unknown as UserRole)
        })

        // Combine the data
        const users = authUsers.users.map((user) => {
            const profile = profiles.find((p) => p.id === user.id) || {}
            const roles = userRolesMap[user.id] || []

            return {
                id: user.id,
                email: user.email || "", // Ensure email is always a string
                firstName: profile.first_name || "",
                lastName: profile.last_name || "",
                roles,
            }
        })

        return users
    } catch (error) {
        console.error("Error getting all users:", error)
        return []
    }
}
