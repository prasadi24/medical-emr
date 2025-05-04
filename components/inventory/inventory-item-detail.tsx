"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { deleteInventoryItem } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

interface InventoryItemDetailProps {
    item: any
    category: any
    transactions: any[]
}

export function InventoryItemDetail({ item, category, transactions }: InventoryItemDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteInventoryItem(item.id)
            toast({
                title: "Item deleted",
                description: "The inventory item has been deleted successfully.",
            })
            router.push("/inventory/items")
        } catch (error) {
            console.error("Error deleting item:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete item",
                variant: "destructive",
            })
            setIsDeleting(false)
        }
    }

    const getStockStatusBadge = (currentStock: number, reorderLevel: number) => {
        if (currentStock <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>
        } else if (currentStock <= reorderLevel) {
            return <Badge variant="warning">Low Stock</Badge>
        } else {
            return <Badge variant="success">In Stock</Badge>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
                <div className="flex space-x-2">
                    <Button asChild variant="outline">
                        <Link href={`/inventory/items/${item.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                        <CardDescription>Basic information about this inventory item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">SKU</p>
                                <p>{item.sku}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <p>{category?.name || "Uncategorized"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                                <div className="flex items-center space-x-2">
                                    <p>{item.current_stock}</p>
                                    {getStockStatusBadge(item.current_stock, item.reorder_level)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                                <p>{item.reorder_level}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                                <p>${item.unit_price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p>${(item.current_stock * item.unit_price).toFixed(2)}</p>
                            </div>
                        </div>
                        {item.description && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{item.description}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button asChild className="w-full">
                            <Link href={`/inventory/transactions/new?item_id=${item.id}`}>
                                <ArrowUpDown className="mr-2 h-4 w-4" /> Record Transaction
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock History</CardTitle>
                        <CardDescription>Recent inventory transactions for this item</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="transactions">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="chart">Stock Chart</TabsTrigger>
                            </TabsList>
                            <TabsContent value="transactions" className="pt-4">
                                {transactions.length > 0 ? (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Reference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions.slice(0, 5).map((transaction) => (
                                                    <TableRow key={transaction.id}>
                                                        <TableCell>{format(new Date(transaction.transaction_date), "MMM d, yyyy")}</TableCell>
                                                        <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                                                        <TableCell>{transaction.quantity}</TableCell>
                                                        <TableCell>{transaction.reference_number || "—"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No transactions found</p>
                                )}
                            </TabsContent>
                            <TabsContent value="chart" className="pt-4">
                                <div className="h-[200px] flex items-center justify-center border rounded-md">
                                    <p className="text-muted-foreground">Stock level chart will be displayed here</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/inventory/items/${item.id}/transactions`}>
                                <Plus className="mr-2 h-4 w-4" /> View All Transactions
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the item &quot;{item.name}&quot;. This action cannot be undone and will
                            remove all associated transaction history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
