"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"
import { getAuditLogs } from "@/app/actions/audit-log-actions"
import { useAuth } from "@/contexts/auth-context"

type AuditLog = {
    id: string
    user_id: string | null
    action: string
    resource_type: string
    resource_id: string | null
    details: any
    ip_address: string | null
    user_agent: string | null
    created_at: string
    user: { email: string } | null
    userProfile?: {
        first_name: string | null
        last_name: string | null
    }
}

const ITEMS_PER_PAGE = 20

export function AuditLogsList() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { hasRole } = useAuth()

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({
        userId: searchParams.get("userId") || "",
        action: searchParams.get("action") || "",
        resourceType: searchParams.get("resourceType") || "",
        resourceId: searchParams.get("resourceId") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
    })
    const [searchTerm, setSearchTerm] = useState("")

    const [hasPermission, setHasPermission] = useState(hasRole("Admin"))

    useEffect(() => {
        setHasPermission(hasRole("Admin"))
    }, [hasRole])

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true)
            const offset = (page - 1) * ITEMS_PER_PAGE

            const { data, count } = await getAuditLogs({
                ...filters,
                limit: ITEMS_PER_PAGE,
                offset,
            })

            setLogs(data)
            setTotalCount(count || 0)
            setLoading(false)
        }

        fetchLogs()
    }, [page, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(1) // Reset to first page when filters change
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement search logic here - could search across multiple fields
        // For now, we'll just filter by resource ID as an example
        handleFilterChange("resourceId", searchTerm)
    }

    const clearFilters = () => {
        setFilters({
            userId: "",
            action: "",
            resourceType: "",
            resourceId: "",
            startDate: "",
            endDate: "",
        })
        setSearchTerm("")
        setPage(1)
    }

    const getActionBadgeColor = (action: string) => {
        switch (action.toLowerCase()) {
            case "create":
                return "bg-green-100 text-green-800"
            case "update":
                return "bg-blue-100 text-blue-800"
            case "delete":
                return "bg-red-100 text-red-800"
            case "view":
                return "bg-gray-100 text-gray-800"
            case "login":
                return "bg-purple-100 text-purple-800"
            case "logout":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    if (!hasPermission) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <p>You do not have permission to view audit logs.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Audit Logs</CardTitle>
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="search"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                        <Button type="submit" size="icon">
                            <SearchIcon className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="create">Create</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                                <SelectItem value="view">View</SelectItem>
                                <SelectItem value="login">Login</SelectItem>
                                <SelectItem value="logout">Logout</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange("resourceType", value)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Resource Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="appointment">Appointment</SelectItem>
                                <SelectItem value="medical_record">Medical Record</SelectItem>
                                <SelectItem value="clinic">Clinic</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.startDate ? format(new Date(filters.startDate), "PP") : "Start Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                                    onSelect={(date) => handleFilterChange("startDate", date ? format(date, "yyyy-MM-dd") : "")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.endDate ? format(new Date(filters.endDate), "PP") : "End Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                                    onSelect={(date) => handleFilterChange("endDate", date ? format(date, "yyyy-MM-dd") : "")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No audit logs found.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                {log.userProfile
                                                    ? `${log.userProfile.first_name || ""} ${log.userProfile.last_name || ""}`
                                                    : log.user?.email || "System"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getActionBadgeColor(log.action)}>
                                                    {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {log.resource_type.charAt(0).toUpperCase() + log.resource_type.slice(1)}
                                                {log.resource_id && ` #${log.resource_id.substring(0, 8)}`}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{log.ip_address}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => router.push(`/audit-logs/${log.id}`)}>
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of{" "}
                                    {totalCount} entries
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span className="sr-only">Previous Page</span>
                                    </Button>
                                    <div className="text-sm">
                                        Page {page} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRightIcon className="h-4 w-4" />
                                        <span className="sr-only">Next Page</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
