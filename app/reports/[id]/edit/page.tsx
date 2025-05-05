"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportForm } from "@/components/reports/report-form"
import { RequireRole } from "@/components/auth/require-role"
import { getReportById } from "@/app/actions/reporting-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EditReportPage({ params }: { params: { id: string } }) {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const reportData = await getReportById(params.id)
                if (reportData) {
                    setReport(reportData)
                } else {
                    setError("Report not found")
                }
            } catch (err) {
                setError("Failed to load report")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchReport()
    }, [params.id])

    return (
        <RequireRole roles={["admin", "doctor"]}>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Edit Report</h1>
                    <Button variant="outline" onClick={() => router.back()}>
                        Back
                    </Button>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Report Configuration</CardTitle>
                            <CardDescription>Update your report settings and parameters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReportForm report={report} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </RequireRole>
    )
}
