"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReportDetail } from "@/components/reports/report-detail"
import { RequireRole } from "@/components/auth/require-role"
import { getReportById } from "@/app/actions/reporting-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
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
        <RequireRole roles={["admin", "doctor", "nurse", "receptionist"]}>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Report Details</h1>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => router.back()}>
                            Back
                        </Button>
                        {report && <Button onClick={() => router.push(`/reports/${params.id}/edit`)}>Edit Report</Button>}
                    </div>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-64 w-full mb-4" />
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <ReportDetail report={report} />
                )}
            </div>
        </RequireRole>
    )
}
