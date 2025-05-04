import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getInventoryItem, getInventoryCategory, getInventoryItemTransactions } from "@/app/actions/inventory-actions"
import { InventoryItemDetail } from "@/components/inventory/inventory-item-detail"

export const metadata: Metadata = {
    title: "Inventory Item Details",
    description: "View details and transaction history for an inventory item.",
}

interface InventoryItemPageProps {
    params: {
        id: string
    }
}

export default async function InventoryItemPage({ params }: InventoryItemPageProps) {
    const item = await getInventoryItem(params.id)

    if (!item) {
        notFound()
    }

    const [category, transactions] = await Promise.all([
        item.category_id ? getInventoryCategory(item.category_id) : null,
        getInventoryItemTransactions(params.id),
    ])

    return (
        <div className="container mx-auto py-6">
            <InventoryItemDetail item={item} category={category} transactions={transactions} />
        </div>
    )
}
