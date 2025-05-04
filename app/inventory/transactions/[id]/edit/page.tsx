import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getInventoryTransaction, getInventoryItems, getInventorySuppliers } from "@/app/actions/inventory-actions"
import { InventoryTransactionForm } from "@/components/inventory/inventory-transaction-form"

export const metadata: Metadata = {
    title: "Edit Inventory Transaction",
    description: "Edit an existing inventory transaction.",
}

interface EditInventoryTransactionPageProps {
    params: {
        id: string
    }
}

export default async function EditInventoryTransactionPage({ params }: EditInventoryTransactionPageProps) {
    const [transaction, items, suppliers] = await Promise.all([
        getInventoryTransaction(params.id),
        getInventoryItems(),
        getInventorySuppliers(),
    ])

    if (!transaction) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Inventory Transaction</h1>
            <div className="max-w-2xl mx-auto">
                <InventoryTransactionForm transaction={transaction} items={items} suppliers={suppliers} />
            </div>
        </div>
    )
}
