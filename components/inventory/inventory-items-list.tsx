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
import { deleteInventoryItem } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InventoryItemsListProps {
    items: any[]
    categories: any[]
}

export function InventoryItemsList({ items, categories }: InventoryItemsListProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<any>(null)

    // Create a map of category IDs to names for easy lookup
    const categoryMap = new Map()
    categories.forEach((category) => {
        categoryMap.set(category.id, category.name)
    })

    // Filter items based on search query
    const filteredItems = searchQuery
        ? items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryMap.get(item.category_id)?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : items

    const handleDelete = async (id: string) => {
        try {
            await deleteInventoryItem(id)
            toast({
                title: "Item deleted",
                description: "The inventory item has been deleted successfully.",
            })
            router.refresh()
        } catch (error) {
            console.error("Error deleting item:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete item",
                variant: "destructive",
            })
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/inventory/items/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{categoryMap.get(item.category_id) || "Uncategorized"}</TableCell>
                                <TableCell>{item.current_stock}</TableCell>
                                <TableCell>{getStockStatusBadge(item.current_stock, item.reorder_level)}</TableCell>
                                <TableCell>${item.unit_price.toFixed(2)}</TableCell>
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
                                                <Link href={`/inventory/items/${item.id}`}>View</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/inventory/items/${item.id}/edit`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/inventory/transactions/new?item_id=${item.id}`}>Add Transaction</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setItemToDelete(item)
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
                        ))}
                        {filteredItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                    No inventory items found.
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
                            This will permanently delete the item &quot;{itemToDelete?.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleDelete(itemToDelete.id)
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
