"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, FileText, Calendar, MoreHorizontal, PlusCircle, Trash2, Edit, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deleteReportConfiguration } from "@/app/actions/reporting-actions"

interface ReportsListProps {
    reports: any[]
}

export function ReportsList({ reports }: ReportsListProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))

        if (activeTab === "all") return matchesSearch
        if (activeTab === "favorites") return matchesSearch && report.is_favorite
        if (activeTab === "scheduled") return matchesSearch && report.schedule

        return matchesSearch && report.report_type === activeTab
    })

    return (
        <div>
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center">
                    <Input placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button asChild>
                    <Link href="/reports/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Report
                    </Link>
                </Button>
            </div>
            <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredReports.map((report) => (
                            <Card key={report.id}>
                                <CardHeader>
                                    <CardTitle>{report.name}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>{report.report_type}</span>
                                    </div>
                                    {report.schedule && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Scheduled: {report.schedule}</span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" asChild>
                                        <Link href={`/reports/${report.id}`}>
                                            View <BarChart3 className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/edit`)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => deleteReportConfiguration(report.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="favorites" className="mt-4">
                    {/* Content for Favorites tab */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredReports
                            .filter((report) => report.is_favorite)
                            .map((report) => (
                                <Card key={report.id}>
                                    <CardHeader>
                                        <CardTitle>{report.name}</CardTitle>
                                        <CardDescription>{report.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4" />
                                            <span>{report.report_type}</span>
                                        </div>
                                        {report.schedule && (
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Scheduled: {report.schedule}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="ghost" asChild>
                                            <Link href={`/reports/${report.id}`}>
                                                View <BarChart3 className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => deleteReportConfiguration(report.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                    </div>
                </TabsContent>
                <TabsContent value="scheduled" className="mt-4">
                    {/* Content for Scheduled tab */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredReports
                            .filter((report) => report.schedule)
                            .map((report) => (
                                <Card key={report.id}>
                                    <CardHeader>
                                        <CardTitle>{report.name}</CardTitle>
                                        <CardDescription>{report.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4" />
                                            <span>{report.report_type}</span>
                                        </div>
                                        {report.schedule && (
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Scheduled: {report.schedule}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="ghost" asChild>
                                            <Link href={`/reports/${report.id}`}>
                                                View <BarChart3 className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => deleteReportConfiguration(report.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
