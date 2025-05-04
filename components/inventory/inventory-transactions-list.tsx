"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { deleteInventoryTransaction } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface InventoryTransactionsListProps {
    transactions: any[]
    items: any[]
    suppliers: any[]
}

export function InventoryTransactionsList({ transactions, items, suppliers }: InventoryTransactionsListProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<any>(null)

    // Create maps for easy lookup
    const itemMap = new Map()
    items.forEach((item) => {
        itemMap.set(item.id, item)
    })

    const supplierMap = new Map()
    suppliers.forEach((supplier) => {
        supplierMap.set(supplier.id, supplier)
    })

    // Filter transactions based on search query
    const filteredTransactions = searchQuery
        ? transactions.filter(
            (transaction) =>
                itemMap.get(transaction.item_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                itemMap.get(transaction.item_id)?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transaction.supplier_id &&
                    supplierMap.get(transaction.supplier_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        : transactions

    const handleDelete = async (id: string) => {
        try {
            await deleteInventoryTransaction(id)
            toast({
                title: "Transaction deleted",
                description: "The inventory transaction has been deleted successfully.",
            })
            router.refresh()
        } catch (error) {
            console.error("Error deleting transaction:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete transaction",
                variant: "destructive",
            })
        }
    }

    const getTransactionTypeBadge = (type: string) => {
        switch (type) {
            case "purchase":
                return <Badge variant="success">Purchase</Badge>
            case "usage":
                return <Badge variant="default">Usage</Badge>
            case "adjustment":
                return <Badge variant="secondary">Adjustment</Badge>
            case "return":
                return <Badge variant="warning">Return</Badge>
            case "transfer":
                return <Badge variant="outline">Transfer</Badge>
            default:
                return <Badge>{type}</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/inventory/transactions/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((transaction) => {
                            const item = itemMap.get(transaction.item_id)
                            const quantity = transaction.quantity
                            const unitPrice = transaction.unit_price || 0
                            const total = quantity * unitPrice

                            return (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.transaction_date
                                            ? format(new Date(transaction.transaction_date), "MMM d, yyyy")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell className="font-medium">{item ? `${item.name} (${item.sku})` : "Unknown Item"}</TableCell>
                                    <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                                    <TableCell>{quantity}</TableCell>
                                    <TableCell>${unitPrice.toFixed(2)}</TableCell>
                                    <TableCell>${total.toFixed(2)}</TableCell>
                                    <TableCell>{transaction.reference_number || "—"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/inventory/transactions/${transaction.id}/edit`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setTransactionToDelete(transaction)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {filteredTransactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this transaction. This action cannot be undone and may affect inventory
                            levels.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleDelete(transactionToDelete.id)
                                setDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
