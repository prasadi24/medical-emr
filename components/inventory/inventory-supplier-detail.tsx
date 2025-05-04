"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { deleteInventorySupplier } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus, ExternalLink, Mail, Phone } from "lucide-react"
import { format } from "date-fns"

interface InventorySupplierDetailProps {
    supplier: any
    transactions: any[]
    items: any[]
}

export function InventorySupplierDetail({ supplier, transactions, items }: InventorySupplierDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteInventorySupplier(supplier.id)
            toast({
                title: "Supplier deleted",
                description: "The supplier has been deleted successfully.",
            })
            router.push("/inventory/suppliers")
        } catch (error) {
            console.error("Error deleting supplier:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete supplier",
                variant: "destructive",
            })
            setIsDeleting(false)
        }
    }

    // Create a map of item IDs to names for easy lookup
    const itemMap = new Map()
    items.forEach((item) => {
        itemMap.set(item.id, item)
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{supplier.name}</h2>
                <div className="flex space-x-2">
                    <Button asChild variant="outline">
                        <Link href={`/inventory/suppliers/${supplier.id}/edit`}>
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
                        <CardTitle>Supplier Details</CardTitle>
                        <CardDescription>Contact information and notes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {supplier.contact_name && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                                <p>{supplier.contact_name}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {supplier.email && (
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${supplier.email}`} className="text-sm hover:underline">
                                        {supplier.email}
                                    </a>
                                </div>
                            )}

                            {supplier.phone && (
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${supplier.phone}`} className="text-sm hover:underline">
                                        {supplier.phone}
                                    </a>
                                </div>
                            )}
                        </div>

                        {supplier.address && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Address</p>
                                <p className="text-sm whitespace-pre-line">{supplier.address}</p>
                            </div>
                        )}

                        {supplier.website && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Website</p>
                                <a
                                    href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-sm text-blue-600 hover:underline"
                                >
                                    <span>{supplier.website}</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}

                        {supplier.notes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="text-sm whitespace-pre-line">{supplier.notes}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button asChild className="w-full">
                            <Link href={`/inventory/transactions/new?supplier_id=${supplier.id}`}>
                                <Plus className="mr-2 h-4 w-4" /> Record Purchase
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Purchase History</CardTitle>
                        <CardDescription>Recent transactions with this supplier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.slice(0, 5).map((transaction) => {
                                            const item = itemMap.get(transaction.item_id)
                                            const total = transaction.quantity * transaction.unit_price

                                            return (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>{format(new Date(transaction.transaction_date), "MMM d, yyyy")}</TableCell>
                                                    <TableCell>{item ? item.name : "Unknown Item"}</TableCell>
                                                    <TableCell>{transaction.quantity}</TableCell>
                                                    <TableCell>${total.toFixed(2)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No transactions found</p>
                        )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/inventory/suppliers/${supplier.id}/transactions`}>View All Transactions</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the supplier &quot;{supplier.name}&quot;. This action cannot be undone.
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
