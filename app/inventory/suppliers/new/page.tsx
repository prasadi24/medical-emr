import type { Metadata } from "next"
import { InventorySupplierForm } from "@/components/inventory/inventory-supplier-form"

export const metadata: Metadata = {
    title: "New Inventory Supplier",
    description: "Add a new supplier to your inventory system.",
}

export default async function NewInventorySupplierPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">New Inventory Supplier</h1>
            <div className="max-w-2xl mx-auto">
                <InventorySupplierForm />
            </div>
        </div>
    )
}
