import type { Metadata } from "next"
import { getInventoryTransactions, getInventoryItems, getInventorySuppliers } from "@/app/actions/inventory-actions"
import { InventoryTransactionsList } from "@/components/inventory/inventory-transactions-list"

export const metadata: Metadata = {
    title: "Inventory Transactions",
    description: "View and manage inventory transactions.",
}

export default async function InventoryTransactionsPage() {
    const [transactions, items, suppliers] = await Promise.all([
        getInventoryTransactions(),
        getInventoryItems(),
        getInventorySuppliers(),
    ])

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Transactions</h1>
            <InventoryTransactionsList transactions={transactions} items={items} suppliers={suppliers} />
        </div>
    )
}
