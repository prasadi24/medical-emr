"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { deleteLabTestType } from "@/app/actions/lab-test-actions"
import { MoreHorizontal, Search } from "lucide-react"

type LabTestType = {
    id: number
    category_id: number | null
    name: string
    description: string | null
    price: number
    preparation_instructions: string | null
    result_turnaround_time: string | null
    category?: {
        id: number
        name: string
    } | null
}

type LabTestCategory = {
    id: number
    name: string
}

type LabTestTypesListProps = {
    testTypes: LabTestType[]
    categories: LabTestCategory[]
}

export function LabTestTypesList({ testTypes: initialTestTypes, categories }: LabTestTypesListProps) {
    const [testTypes, setTestTypes] = useState<LabTestType[]>(initialTestTypes)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<number | "all">("all")
    const router = useRouter()
    const { toast } = useToast()

    const handleDeleteTestType = async (typeId: number) => {
        if (confirm("Are you sure you want to delete this test type? This action cannot be undone.")) {
            const result = await deleteLabTestType(typeId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setTestTypes(testTypes.filter((type) => type.id !== typeId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const filteredTestTypes = testTypes.filter((testType) => {
        const matchesSearch = testType.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "all" || testType.category_id === categoryFilter
        return matchesSearch && matchesCategory
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search test types..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">Filter by category:</span>
                    <select
                        className="border rounded p-1"
                        value={categoryFilter === "all" ? "all" : categoryFilter.toString()}
                        onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : Number.parseInt(e.target.value))}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id.toString()}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Turnaround Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTestTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        {searchTerm || categoryFilter !== "all"
                                            ? "No test types found matching your search"
                                            : "No test types found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTestTypes.map((testType) => (
                                    <TableRow key={testType.id}>
                                        <TableCell className="font-medium">
                                            <div>{testType.name}</div>
                                            {testType.description && (
                                                <div className="text-xs text-muted-foreground">{testType.description}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>{testType.category?.name || "Uncategorized"}</TableCell>
                                        <TableCell>{formatPrice(testType.price)}</TableCell>
                                        <TableCell>{testType.result_turnaround_time || "Not specified"}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/lab-tests/types/${testType.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/lab-tests/types/${testType.id}/edit`)}>
                                                        Edit Test Type
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTestType(testType.id)}>
                                                        Delete Test Type
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
