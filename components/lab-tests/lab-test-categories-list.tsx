"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { deleteLabTestCategory } from "@/app/actions/lab-test-actions"
import { MoreHorizontal, Search } from "lucide-react"

type LabTestCategory = {
    id: number
    name: string
    description: string | null
}

type LabTestCategoriesListProps = {
    categories: LabTestCategory[]
}

export function LabTestCategoriesList({ categories: initialCategories }: LabTestCategoriesListProps) {
    const [categories, setCategories] = useState<LabTestCategory[]>(initialCategories)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    const { toast } = useToast()

    const handleDeleteCategory = async (categoryId: number) => {
        if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            const result = await deleteLabTestCategory(categoryId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setCategories(categories.filter((category) => category.id !== categoryId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const filteredCategories = categories.filter((category) => {
        return category.name.toLowerCase().includes(searchTerm.toLowerCase())
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search categories..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        {searchTerm ? "No categories found matching your search" : "No categories found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || "No description"}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/lab-tests/categories/${category.id}/edit`)}>
                                                        Edit Category
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category.id)}>
                                                        Delete Category
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
