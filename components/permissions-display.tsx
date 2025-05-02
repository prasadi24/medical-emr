"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Permission = {
    id: number
    name: string
    description: string | null
    resource: string
    action: string
}

type PermissionsDisplayProps = {
    roleId: number
}

export function PermissionsDisplay({ roleId }: PermissionsDisplayProps) {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPermissions() {
            setIsLoading(true)
            setError(null)

            try {
                const supabase = createClientSupabaseClient()

                const { data, error } = await supabase.from("role_permissions").select("permissions(*)").eq("role_id", roleId)

                if (error) {
                    throw error
                }

                setPermissions(data.map((item) => item.permissions as unknown as Permission))
            } catch (err) {
                console.error("Error fetching permissions:", err)
                setError("Failed to load permissions")
            } finally {
                setIsLoading(false)
            }
        }

        fetchPermissions()
    }, [roleId])

    // Group permissions by resource
    const permissionsByResource = permissions.reduce(
        (acc, permission) => {
            if (!acc[permission.resource]) {
                acc[permission.resource] = []
            }
            acc[permission.resource].push(permission)
            return acc
        },
        {} as Record<string, Permission[]>,
    )

    if (isLoading) {
        return <div>Loading permissions...</div>
    }

    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Permissions assigned to this role</CardDescription>
            </CardHeader>
            <CardContent>
                {Object.keys(permissionsByResource).length === 0 ? (
                    <p>No permissions assigned to this role.</p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(permissionsByResource).map(([resource, perms]) => (
                            <div key={resource} className="border-b pb-3 last:border-0">
                                <h3 className="font-medium text-lg capitalize mb-2">{resource}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {perms.map((permission) => (
                                        <Badge key={permission.id} variant="outline">
                                            {permission.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
