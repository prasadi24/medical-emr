"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsList } from "@/components/reports/reports-list"
import { ReportForm } from "@/components/reports/report-form"
import { DashboardStats } from "@/components/reports/dashboard-stats"
import { RequireRole } from "@/components/auth/require-role"

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const router = useRouter()

    return (
        <RequireRole roles={["admin", "doctor", "nurse", "receptionist"]}>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <Button onClick={() => router.push("/reports/new")}>Create New Report</Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="reports">Saved Reports</TabsTrigger>
                        <TabsTrigger value="create">Quick Report</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analytics Dashboard</CardTitle>
                                <CardDescription>Key performance indicators and metrics for your medical practice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DashboardStats />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Reports</CardTitle>
                                <CardDescription>View and manage your saved reports</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReportsList reports={[]} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="create">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Quick Report</CardTitle>
                                <CardDescription>Generate a custom report without saving</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReportForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </RequireRole>
    )
}
