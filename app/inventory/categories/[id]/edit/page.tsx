import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getInventoryCategory, getInventoryCategories } from "@/app/actions/inventory-actions"
import { InventoryCategoryForm } from "@/components/inventory/inventory-category-form"

export const metadata: Metadata = {
    title: "Edit Inventory Category",
    description: "Edit an existing inventory category.",
}

interface EditInventoryCategoryPageProps {
    params: {
        id: string
    }
}

export default async function EditInventoryCategoryPage({ params }: EditInventoryCategoryPageProps) {
    const [category, categories] = await Promise.all([getInventoryCategory(params.id), getInventoryCategories()])

    if (!category) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Inventory Category</h1>
            <div className="max-w-2xl mx-auto">
                <InventoryCategoryForm category={category} categories={categories} />
            </div>
        </div>
    )
}
