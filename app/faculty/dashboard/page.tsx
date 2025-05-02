"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { BookOpen, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FacultyDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({
        subjects: 0,
        students: 0,
        feedback: 0,
    })
    const [loading, setLoading] = useState(true)
    const [recentFeedback, setRecentFeedback] = useState<any[]>([])

    useEffect(() => {
        if (user?.role !== "faculty") {
            router.push("/")
            return
        }

        async function fetchData() {
            setLoading(true)

            if (!user) return

            // Get faculty ID
            const { data: facultyData } = await supabase
                .from("faculty")
                .select("id, subjects")
                .eq("user_id", user.id)
                .single()

            if (!facultyData) {
                setLoading(false)
                return
            }

            // Count subjects
            const subjectsCount = facultyData.subjects ? facultyData.subjects.length : 0

            // Count students in those subjects
            let studentsCount = 0
            if (facultyData.subjects && facultyData.subjects.length > 0) {
                const { count } = await supabase
                    .from("feedback")
                    .select("student_id", { count: "exact", head: true })
                    .eq("faculty_id", facultyData.id)
                    .is("student_id", "not.null")

                studentsCount = count || 0
            }

            // Count feedback
            const { count: feedbackCount } = await supabase
                .from("feedback")
                .select("*", { count: "exact", head: true })
                .eq("faculty_id", facultyData.id)

            // Get recent feedback
            const { data: feedback } = await supabase
                .from("feedback")
                .select(`
          id,
          text,
          rating,
          created_at,
          students(id, user_id, users(name)),
          subjects(name)
        `)
                .eq("faculty_id", facultyData.id)
                .order("created_at", { ascending: false })
                .limit(5)

            setStats({
                subjects: subjectsCount,
                students: studentsCount,
                feedback: feedbackCount || 0,
            })

            setRecentFeedback(feedback || [])
            setLoading(false)
        }

        fetchData()
    }, [user, router])

    // Sample data for charts
    const lineChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Average Rating",
                data: [3.5, 3.8, 4.2, 4.0, 4.5, 4.3],
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.1)",
                tension: 0.3,
            },
        ],
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                <p className="text-muted-foreground">Manage your subjects and student feedback</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.subjects}</div>
                        <p className="text-xs text-muted-foreground">Courses you're teaching</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground">Students in your courses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Feedback Received</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.feedback}</div>
                        <p className="text-xs text-muted-foreground">Total feedback submissions</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback Ratings</CardTitle>
                            <CardDescription>Your average feedback ratings over time</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <LineChart className="h-[300px]" data={lineChartData} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Feedback</CardTitle>
                                <CardDescription>The latest feedback from your students</CardDescription>
                            </div>
                            <Button asChild size="sm">
                                <Link href="/faculty/feedback">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentFeedback.length > 0 ? (
                                <div className="space-y-4">
                                    {recentFeedback.map((feedback) => (
                                        <div key={feedback.id} className="border-b pb-4 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{feedback.students?.users?.name || "Anonymous Student"}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(feedback.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {feedback.subjects?.name || "Unknown Subject"}
                                            </div>
                                            <div className="mt-2 text-sm">{feedback.text}</div>
                                            <div className="mt-1 text-sm font-medium">Rating: {feedback.rating}/5</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">No feedback received yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
