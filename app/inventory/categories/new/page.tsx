import type { Metadata } from "next"
import { getInventoryCategories } from "@/app/actions/inventory-actions"
import { InventoryCategoryForm } from "@/components/inventory/inventory-category-form"

export const metadata: Metadata = {
    title: "New Inventory Category",
    description: "Create a new inventory category.",
}

export default async function NewInventoryCategoryPage() {
    const categories = await getInventoryCategories()

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">New Inventory Category</h1>
            <div className="max-w-2xl mx-auto">
                <InventoryCategoryForm categories={categories} />
            </div>
        </div>
    )
}
