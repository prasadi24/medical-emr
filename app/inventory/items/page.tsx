import type { Metadata } from "next"
import { getInventoryItems, getInventoryCategories } from "@/app/actions/inventory-actions"
import { InventoryItemsList } from "@/components/inventory/inventory-items-list"

export const metadata: Metadata = {
    title: "Inventory Items",
    description: "Manage your inventory items and stock levels.",
}

export default async function InventoryItemsPage() {
    const [items, categories] = await Promise.all([getInventoryItems(), getInventoryCategories()])

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Items</h1>
            <InventoryItemsList items={items} categories={categories} />
        </div>
    )
}
