import type { Metadata } from "next"
import { getInventorySuppliers } from "@/app/actions/inventory-actions"
import { InventorySuppliersList } from "@/components/inventory/inventory-suppliers-list"

export const metadata: Metadata = {
    title: "Inventory Suppliers",
    description: "Manage your inventory suppliers.",
}

export default async function InventorySuppliersPage() {
    const suppliers = await getInventorySuppliers()

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Suppliers</h1>
            <InventorySuppliersList suppliers={suppliers} />
        </div>
    )
}
