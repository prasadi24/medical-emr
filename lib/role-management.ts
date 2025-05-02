import { createServerSupabaseClient } from "@/lib/supabase/server"

export type UserRole = {
    id: number
    name: string
    description: string | null
}

export type Permission = {
    id: number
    name: string
    description: string | null
    resource: string
    action: string
}

/**
 * Get all roles from the database
 */
export async function getAllRoles(): Promise<UserRole[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("roles").select("*")

    if (error) {
        console.error("Error fetching roles:", error)
        return []
    }

    return data
}

// Fix the getUserRoles function to properly map the data
export async function getUserRoles(userId: string): Promise<UserRole[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("user_roles").select("roles(*)").eq("user_id", userId)

    if (error) {
        console.error("Error fetching user roles:", error)
        return []
    }

    return data.map((item) => item.roles as unknown as UserRole) || []
}

// Fix the getRolePermissions function to properly map the data
export async function getRolePermissions(roleId: number): Promise<Permission[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("role_permissions").select("permissions(*)").eq("role_id", roleId)

    if (error) {
        console.error("Error fetching role permissions:", error)
        return []
    }

    return data.map((item) => item.permissions as unknown as Permission) || []
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
    const supabase = createServerSupabaseClient()

    // First, get the role ID
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id").eq("name", roleName).single()

    if (roleError) {
        console.error("Error finding role:", roleError)
        return false
    }

    // Check if the user already has this role
    const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role_id", roleData.id)

    if (checkError) {
        console.error("Error checking existing role:", checkError)
        return false
    }

    // If the user already has the role, return true
    if (existingRole && existingRole.length > 0) {
        return true
    }

    // Assign the role to the user
    const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: roleData.id,
    })

    if (error) {
        console.error("Error assigning role:", error)
        return false
    }

    return true
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
    const supabase = createServerSupabaseClient()

    // First, get the role ID
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id").eq("name", roleName).single()

    if (roleError) {
        console.error("Error finding role:", roleError)
        return false
    }

    // Remove the role from the user
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role_id", roleData.id)

    if (error) {
        console.error("Error removing role:", error)
        return false
    }

    return true
}

/**
 * Check if a user has a specific permission
 */
export async function userHasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const supabase = createServerSupabaseClient()

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", userId)

    if (rolesError || !userRoles || userRoles.length === 0) {
        console.error("Error fetching user roles:", rolesError)
        return false
    }

    const roleIds = userRoles.map((ur) => ur.role_id)

    // Check if any of the user's roles have the required permission
    const { data: permissions, error: permError } = await supabase
        .from("role_permissions")
        .select("permissions!inner(resource, action)")
        .in("role_id", roleIds)
        .eq("permissions.resource", resource)
        .eq("permissions.action", action)

    if (permError) {
        console.error("Error checking permissions:", permError)
        return false
    }

    return permissions && permissions.length > 0
}
