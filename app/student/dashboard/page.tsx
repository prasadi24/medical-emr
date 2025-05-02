"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, ClipboardList, FileText, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [studentData, setStudentData] = useState<any>(null)
    const [tasks, setTasks] = useState<any[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.role !== "student") {
            router.push("/")
            return
        }

        async function fetchData() {
            setLoading(true)

            if (!user) return

            // Get student data
            const { data: student } = await supabase.from("students").select("*, users(name)").eq("user_id", user.id).single()

            if (student) {
                setStudentData(student)

                // Get tasks
                const { data: taskData } = await supabase
                    .from("tasks")
                    .select("*")
                    .eq("student_id", student.id)
                    .order("due_date", { ascending: true })
                    .limit(5)

                setTasks(taskData || [])

                // Get AI suggestions
                const { data: suggestionData } = await supabase
                    .from("ai_suggestions")
                    .select("*")
                    .eq("student_id", student.id)
                    .order("created_at", { ascending: false })
                    .limit(3)

                setSuggestions(suggestionData || [])
            }

            setLoading(false)
        }

        fetchData()
    }, [user, router])

    // Calculate task completion percentage
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {studentData?.users?.name || "Student"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Category</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentData?.category || "Not Assigned"}</div>
                        <p className="text-xs text-muted-foreground">Your learning profile</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentData?.department || "Not Set"}</div>
                        <p className="text-xs text-muted-foreground">Year: {studentData?.year || "Not Set"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedTasks}/{tasks.length}
                        </div>
                        <Progress value={completionPercentage} className="mt-2" />
                        <p className="mt-2 text-xs text-muted-foreground">Tasks completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{suggestions.length}</div>
                        <p className="text-xs text-muted-foreground">Personalized suggestions</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tasks" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
                    <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                    <TabsTrigger value="trainings">Recommended Trainings</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tasks & Deadlines</CardTitle>
                                <CardDescription>Manage your upcoming tasks and deadlines</CardDescription>
                            </div>
                            <Button asChild size="sm">
                                <Link href="/student/time-manager">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {tasks.length > 0 ? (
                                <div className="space-y-4">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                            <div>
                                                <div className="font-medium">{task.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${task.status === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                        }`}
                                                >
                                                    {task.status === "completed" ? "Completed" : "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">
                                    No tasks scheduled. Add some to stay organized!
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/student/time-manager">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Manage Tasks
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="suggestions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Powered Suggestions</CardTitle>
                            <CardDescription>Personalized insights to improve your performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {suggestions.length > 0 ? (
                                <div className="space-y-4">
                                    {suggestions.map((suggestion) => (
                                        <div key={suggestion.id} className="rounded-lg bg-muted p-4">
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                                <span className="font-medium">AI Suggestion</span>
                                            </div>
                                            <p className="mt-2 text-sm">{suggestion.suggestion_text}</p>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {new Date(suggestion.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">No AI suggestions available yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="trainings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Trainings</CardTitle>
                            <CardDescription>Based on your category: {studentData?.category || "Not Assigned"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-6 text-center text-muted-foreground">
                                Training recommendations will appear here based on your profile.
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/student/trainings">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View All Trainings
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
