"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { Users, BookOpen, FileText, GraduationCap } from "lucide-react"

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        subjects: 0,
        feedback: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        async function fetchStats() {
            setLoading(true)

            // Fetch student count
            const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true })

            // Fetch faculty count
            const { count: facultyCount } = await supabase.from("faculty").select("*", { count: "exact", head: true })

            // Fetch subjects count
            const { count: subjectsCount } = await supabase.from("subjects").select("*", { count: "exact", head: true })

            // Fetch feedback count
            const { count: feedbackCount } = await supabase.from("feedback").select("*", { count: "exact", head: true })

            setStats({
                students: studentCount || 0,
                faculty: facultyCount || 0,
                subjects: subjectsCount || 0,
                feedback: feedbackCount || 0,
            })

            setLoading(false)
        }

        fetchStats()
    }, [user, router])

    // Sample data for charts
    const barChartData = {
        labels: ["Explorer", "Doer", "Achiever"],
        datasets: [
            {
                label: "Students by Category",
                data: [18, 25, 12],
                backgroundColor: ["#4f46e5", "#0ea5e9", "#10b981"],
            },
        ],
    }

    const lineChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Feedback Submissions",
                data: [12, 19, 15, 22, 30, 25],
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.1)",
                tension: 0.3,
            },
        ],
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of the educational feedback system</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground">Registered in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.faculty}</div>
                        <p className="text-xs text-muted-foreground">Active teaching staff</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.subjects}</div>
                        <p className="text-xs text-muted-foreground">Courses being taught</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Feedback</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.feedback}</div>
                        <p className="text-xs text-muted-foreground">Feedback submissions</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Student Categories</CardTitle>
                                <CardDescription>Distribution of students by category</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <BarChart className="h-[300px]" data={barChartData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Feedback Trends</CardTitle>
                                <CardDescription>Monthly feedback submission trends</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <LineChart className="h-[300px]" data={lineChartData} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Analytics</CardTitle>
                            <CardDescription>Detailed analysis of student performance and feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Advanced analytics content will be displayed here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Reports</CardTitle>
                            <CardDescription>Generated reports and insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Reports content will be displayed here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
