import type { Metadata } from "next"
import { getInventoryCategories, getInventorySuppliers } from "@/app/actions/inventory-actions"
import { InventoryItemForm } from "@/components/inventory/inventory-item-form"

export const metadata: Metadata = {
    title: "New Inventory Item",
    description: "Add a new item to your inventory.",
}

export default async function NewInventoryItemPage() {
    const [categories, suppliers] = await Promise.all([getInventoryCategories(), getInventorySuppliers()])

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">New Inventory Item</h1>
            <div className="max-w-2xl mx-auto">
                <InventoryItemForm categories={categories} suppliers={suppliers} />
            </div>
        </div>
    )
}
