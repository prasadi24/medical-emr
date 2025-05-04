"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportForm } from "@/components/reports/report-form"
import { RequireRole } from "@/components/auth/require-role"

export default function NewReportPage() {
    const router = useRouter()

    return (
        <RequireRole roles={["admin", "doctor"]}>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Create New Report</h1>
                    <Button variant="outline" onClick={() => router.back()}>
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Report Configuration</CardTitle>
                        <CardDescription>Configure and save a new report for future reference</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportForm saveReport={true} />
                    </CardContent>
                </Card>
            </div>
        </RequireRole>
    )
}
