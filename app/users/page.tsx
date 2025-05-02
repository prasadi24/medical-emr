import { getAllUsers } from "@/app/actions/user-actions"
import { getAllRoles } from "@/lib/role-management"
import { UserManagement } from "@/components/user-management"

export default async function UsersPage() {
    const users = await getAllUsers()
    const roles = await getAllRoles()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage users and their roles</p>
            </div>

            <UserManagement users={users} roles={roles} />
        </div>
    )
}
