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
import { deleteInventoryCategory } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search } from "lucide-react"

interface InventoryCategoriesListProps {
    categories: any[]
}

export function InventoryCategoriesList({ categories }: InventoryCategoriesListProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null)

    // Build a map of parent-child relationships
    const categoryMap = new Map()
    categories.forEach((category) => {
        categoryMap.set(category.id, {
            ...category,
            children: [],
        })
    })

    // Organize categories into a tree structure
    const rootCategories: any[] = []
    categories.forEach((category) => {
        if (category.parent_category_id) {
            const parent = categoryMap.get(category.parent_category_id)
            if (parent) {
                parent.children.push(categoryMap.get(category.id))
            } else {
                rootCategories.push(categoryMap.get(category.id))
            }
        } else {
            rootCategories.push(categoryMap.get(category.id))
        }
    })

    // Filter categories based on search query
    const filteredCategories = searchQuery
        ? categories.filter(
            (category) =>
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : rootCategories

    const handleDelete = async (id: string) => {
        try {
            await deleteInventoryCategory(id)
            toast({
                title: "Category deleted",
                description: "The inventory category has been deleted successfully.",
            })
            router.refresh()
        } catch (error) {
            console.error("Error deleting category:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete category",
                variant: "destructive",
            })
        }
    }

    const renderCategoryRow = (category: any, level = 0) => {
        return (
            <>
                <TableRow key={category.id}>
                    <TableCell className="font-medium">
                        <div style={{ paddingLeft: `${level * 20}px` }}>{category.name}</div>
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
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
                                    <Link href={`/inventory/categories/${category.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCategoryToDelete(category)
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
                {category.children?.map((child: any) => renderCategoryRow(child, level + 1))}
            </>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/inventory/categories/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchQuery
                            ? filteredCategories.map((category) => renderCategoryRow(category))
                            : rootCategories.map((category) => renderCategoryRow(category))}
                        {filteredCategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                    No categories found.
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
                            This will permanently delete the category &quot;{categoryToDelete?.name}&quot;. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleDelete(categoryToDelete.id)
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
