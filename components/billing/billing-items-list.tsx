"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, MoreVertical, Plus, Search, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { deleteBillingItem } from "@/app/actions/billing-actions"

interface BillingItemsListProps {
    billingItems: any[]
    categories?: string[]
}

export function BillingItemsList({ billingItems, categories = [] }: BillingItemsListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this billing item?")) {
            setIsDeleting(id)
            try {
                const result = await deleteBillingItem(id)
                if (result.success) {
                    toast({
                        title: "Success",
                        description: result.message,
                    })
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    })
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete billing item",
                    variant: "destructive",
                })
            } finally {
                setIsDeleting(null)
            }
        }
    }

    // Extract unique categories if not provided
    const uniqueCategories =
        categories.length > 0 ? categories : Array.from(new Set(billingItems.map((item) => item.category))).sort()

    // Filter items based on search and filters
    const filteredItems = billingItems.filter((item) => {
        const matchesSearch =
            searchTerm === "" ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && item.is_active) ||
            (statusFilter === "inactive" && !item.is_active)

        return matchesSearch && matchesCategory && matchesStatus
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Billing Items</CardTitle>
                <Button size="sm" asChild>
                    <Link href="/billing/items/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search billing items..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {uniqueCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">No billing items found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.code}</TableCell>
                                    <TableCell>
                                        <div>{item.name}</div>
                                        {item.description && (
                                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">{item.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right">${item.default_price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.is_active ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" disabled={isDeleting === item.id}>
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/billing/items/${item.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeleting === item.id}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {isDeleting === item.id ? "Deleting..." : "Delete"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}