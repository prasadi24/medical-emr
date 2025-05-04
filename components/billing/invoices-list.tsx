"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarIcon, FileText, MoreVertical, Plus, Search, Printer, CreditCard } from 'lucide-react'
import { formatDate } from "@/lib/utils"

interface InvoicesListProps {
    invoices: any[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export function InvoicesList({ invoices, totalCount, currentPage, pageSize }: InvoicesListProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
    })

    const totalPages = Math.ceil(totalCount / pageSize)

    const handleSearch = () => {
        const params = new URLSearchParams()

        // Copy existing params
        searchParams.forEach((value, key) => {
            params.set(key, value)
        })

        if (searchTerm) {
            params.set("search", searchTerm)
        } else {
            params.delete("search")
        }

        if (statusFilter && statusFilter !== "all") {
            params.set("status", statusFilter)
        } else {
            params.delete("status")
        }

        if (dateRange.startDate) {
            params.set("startDate", dateRange.startDate)
        } else {
            params.delete("startDate")
        }

        if (dateRange.endDate) {
            params.set("endDate", dateRange.endDate)
        } else {
            params.delete("endDate")
        }

        // Reset to first page when filtering
        params.set("page", "1")

        router.push(`/billing/invoices?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()

        // Copy existing params
        searchParams.forEach((value, key) => {
            params.set(key, value)
        })

        params.set("page", page.toString())
        router.push(`/billing/invoices?${params.toString()}`)
    }

    const handleClearFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setDateRange({ startDate: "", endDate: "" })
        router.push("/billing/invoices")
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Draft
                    </Badge>
                )
            case "issued":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Issued
                    </Badge>
                )
            case "paid":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Paid
                    </Badge>
                )
            case "partially_paid":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Partially Paid
                    </Badge>
                )
            case "overdue":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Overdue
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Cancelled
                    </Badge>
                )
            case "refunded":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Refunded
                    </Badge>
                )
            case "insurance_pending":
                return (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        Insurance Pending
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Button size="sm" asChild>
                    <Link href="/billing/invoices/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoices..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="issued">Issued</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="insurance_pending">Insurance Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                placeholder="Start date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-[150px]"
                            />
                            <span>to</span>
                            <Input
                                type="date"
                                placeholder="End date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-[150px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            <Button variant="ghost" onClick={handleClearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {invoices.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">No invoices found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/billing/invoices/${invoice.id}`} className="hover:underline">
                                            {invoice.invoice_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/patients/${invoice.patient_id}`} className="hover:underline">
                                            {invoice.patient?.first_name} {invoice.patient?.last_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div>{formatDate(invoice.issued_date)}</div>
                                        <div className="text-sm text-muted-foreground">Due: {formatDate(invoice.due_date)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">${invoice.total_amount.toFixed(2)}</div>
                                        {invoice.payments && invoice.payments.length > 0 && (
                                            <div className="text-sm text-muted-foreground">
                                                Paid: $
                                                {invoice.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0).toFixed(2)}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/billing/invoices/${invoice.id}`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/billing/invoices/${invoice.id}/print`}>
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Print Invoice
                                                    </Link>
                                                </DropdownMenuItem>
                                                {(invoice.status === "issued" ||
                                                    invoice.status === "partially_paid" ||
                                                    invoice.status === "overdue") && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/billing/invoices/${invoice.id}/payment`}>
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Record Payment
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {totalPages > 1 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                        e.preventDefault()
                                        if (currentPage > 1) handlePageChange(currentPage - 1)
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum

                                if (totalPages <= 5) {
                                    // Show all pages if 5 or fewer
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    // Near the start
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    // Near the end
                                    pageNum = totalPages - 4 + i
                                } else {
                                    // In the middle
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                e.preventDefault()
                                                handlePageChange(pageNum)
                                            }}
                                            isActive={pageNum === currentPage}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                e.preventDefault()
                                                handlePageChange(totalPages)
                                            }}
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </CardContent>
        </Card>
    )
}