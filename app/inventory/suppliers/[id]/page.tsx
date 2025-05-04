import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
    getInventorySupplier,
    getInventorySupplierTransactions,
    getInventoryItems,
} from "@/app/actions/inventory-actions"
import { InventorySupplierDetail } from "@/components/inventory/inventory-supplier-detail"

export const metadata: Metadata = {
    title: "Supplier Details",
    description: "View details and transaction history for a supplier.",
}

interface InventorySupplierPageProps {
    params: {
        id: string
    }
}

export default async function InventorySupplierPage({ params }: InventorySupplierPageProps) {
    const supplier = await getInventorySupplier(params.id)

    if (!supplier) {
        notFound()
    }

    const [transactions, items] = await Promise.all([getInventorySupplierTransactions(params.id), getInventoryItems()])

    return (
        <div className="container mx-auto py-6">
            <InventorySupplierDetail supplier={supplier} transactions={transactions} items={items} />
        </div>
    )
}
