import type { Metadata } from "next"
import { getInventoryDashboardStats } from "@/app/actions/inventory-actions"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"

export const metadata: Metadata = {
    title: "Inventory Management",
    description: "Manage your medical inventory items, track stock levels, and record transactions.",
}

export default async function InventoryPage() {
    const stats = await getInventoryDashboardStats()

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Management</h1>
            <InventoryDashboard stats={stats} />
        </div>
    )
}
