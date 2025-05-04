import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getInventoryItem, getInventoryCategories, getInventorySuppliers } from "@/app/actions/inventory-actions"
import { InventoryItemForm } from "@/components/inventory/inventory-item-form"

export const metadata: Metadata = {
    title: "Edit Inventory Item",
    description: "Edit an existing inventory item.",
}

interface EditInventoryItemPageProps {
    params: {
        id: string
    }
}

export default async function EditInventoryItemPage({ params }: EditInventoryItemPageProps) {
    const [item, categories, suppliers] = await Promise.all([
        getInventoryItem(params.id),
        getInventoryCategories(),
        getInventorySuppliers(),
    ])

    if (!item) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Inventory Item</h1>
            <div className="max-w-2xl mx-auto">
                <InventoryItemForm item={item} categories={categories} suppliers={suppliers} />
            </div>
        </div>
    )
}
