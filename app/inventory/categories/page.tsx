import type { Metadata } from "next"
import { getInventoryCategories } from "@/app/actions/inventory-actions"
import { InventoryCategoriesList } from "@/components/inventory/inventory-categories-list"

export const metadata: Metadata = {
    title: "Inventory Categories",
    description: "Manage categories for your inventory items.",
}

export default async function InventoryCategoriesPage() {
    const categories = await getInventoryCategories()

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Categories</h1>
            <InventoryCategoriesList categories={categories} />
        </div>
    )
}
