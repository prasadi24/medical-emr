"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Download, Edit, Play, Printer, Share } from 'lucide-react'
import {
    getReportById,
    generateReportData,
    type ReportConfiguration
} from "@/app/actions/reporting-actions"

interface ReportDetailProps {
    report?: ReportConfiguration
    id: string
}

export function ReportDetail({ report: initialReport, id }: ReportDetailProps) {
    const [report, setReport] = useState<ReportConfiguration | null>(initialReport || null)
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(!initialReport)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("preview")
    const router = useRouter()

    useEffect(() => {
        if (!initialReport && id) {
            const fetchReport = async () => {
                try {
                    setLoading(true)
                    const data = await getReportById(id)
                    if (data) {
                        setReport(data)
                        setError(null)
                    } else {
                        setError("Report not found")
                    }
                } catch (err) {
                    console.error("Error fetching report:", err)
                    setError("Failed to load report")
                } finally {
                    setLoading(false)
                }
            }

            fetchReport()
        }
    }, [initialReport, id])

    const handleGenerateReport = async () => {
        if (!report) return

        try {
            setGenerating(true)
            const data = await generateReportData(report.report_type, report.parameters)
            setReportData(data)
            setActiveTab("results")
        } catch (err) {
            console.error("Error generating report:", err)
            setError("Failed to generate report")
        } finally {
            setGenerating(false)
        }
    }

    const handleEdit = () => {
        if (report) {
            router.push(`/reports/${report.id}/edit`)
        }
    }

    const handleBack = () => {
        router.push("/reports")
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-[500px] w-full" />
            </div>
        )
    }

    if (!report) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>The requested report could not be found.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">{report.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button onClick={handleGenerateReport} disabled={generating}>
                        <Play className="h-4 w-4 mr-2" />
                        {generating ? "Generating..." : "Run Report"}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Report Details</CardTitle>
                    <CardDescription>{report.description || "No description provided"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium mb-1">Report Type</h3>
                            <p className="text-sm text-muted-foreground">
                                {report.report_type.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-1">Created</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date(report.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-1">Visibility</h3>
                            <p className="text-sm text-muted-foreground">
                                {report.is_public ? "Public" : "Private"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date(report.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="results" disabled={!reportData}>Results</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Preview</CardTitle>
                            <CardDescription>
                                This is a preview of how your report will look. Run the report to see actual data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center border rounded-md">
                                <p className="text-muted-foreground">
                                    {generating ? "Generating report..." : "Run the report to see results"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="parameters">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Parameters</CardTitle>
                            <CardDescription>
                                These parameters will be used when generating the report.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {report.parameters.timeframe && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Timeframe</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {report.parameters.timeframe}
                                        </p>
                                    </div>
                                )}

                                {report.parameters.startDate && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Start Date</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(report.parameters.startDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {report.parameters.endDate && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">End Date</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(report.parameters.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {report.parameters.format && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Format</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {report.parameters.format}
                                        </p>
                                    </div>
                                )}

                                {report.parameters.chartType && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Chart Type</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {report.parameters.chartType}
                                        </p>
                                    </div>
                                )}

                                {report.parameters.limit && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Limit</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {report.parameters.limit}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Report Results</CardTitle>
                                    <CardDescription>
                                        Generated on {new Date().toLocaleString()}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {reportData ? (
                                <div className="space-y-6">
                                    <div className="border rounded-md p-4">
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(reportData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[400px] flex items-center justify-center">
                                    <p className="text-muted-foreground">No results available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}