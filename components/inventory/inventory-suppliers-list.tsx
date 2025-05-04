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
import { deleteInventorySupplier } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search } from "lucide-react"

interface InventorySuppliersListProps {
    suppliers: any[]
}

export function InventorySuppliersList({ suppliers }: InventorySuppliersListProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [supplierToDelete, setSupplierToDelete] = useState<any>(null)

    // Filter suppliers based on search query
    const filteredSuppliers = searchQuery
        ? suppliers.filter(
            (supplier) =>
                supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : suppliers

    const handleDelete = async (id: string) => {
        try {
            await deleteInventorySupplier(id)
            toast({
                title: "Supplier deleted",
                description: "The supplier has been deleted successfully.",
            })
            router.refresh()
        } catch (error) {
            console.error("Error deleting supplier:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete supplier",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search suppliers..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/inventory/suppliers/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Supplier
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell>{supplier.contact_name || "—"}</TableCell>
                                <TableCell>{supplier.email || "—"}</TableCell>
                                <TableCell>{supplier.phone || "—"}</TableCell>
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
                                                <Link href={`/inventory/suppliers/${supplier.id}`}>View</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/inventory/suppliers/${supplier.id}/edit`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSupplierToDelete(supplier)
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
                        {filteredSuppliers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                    No suppliers found.
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
                            This will permanently delete the supplier &quot;{supplierToDelete?.name}&quot;. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleDelete(supplierToDelete.id)
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
