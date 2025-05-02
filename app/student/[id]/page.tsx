"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Loader2, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function StudentDetailPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [studentData, setStudentData] = useState<any>(null)
    const [feedbackHistory, setFeedbackHistory] = useState<any[]>([])
    const [facultyId, setFacultyId] = useState<string | null>(null)

    useEffect(() => {
        if (user?.role !== "faculty") {
            router.push("/")
            return
        }

        fetchData()
    }, [user, router, params])

    const fetchData = async () => {
        setLoading(true)

        if (!user || !params.id) return

        // Get faculty ID
        const { data: facultyData } = await supabase.from("faculty").select("id").eq("user_id", user.id).single()

        if (facultyData) {
            setFacultyId(facultyData.id)

            // Fetch student data
            const { data: student, error } = await supabase
                .from("students")
                .select(
                    `
          id, 
          department, 
          year, 
          category,
          skills,
          bio,
          interests,
          users (
            id, 
            name, 
            email
          )
        `,
                )
                .eq("id", params.id)
                .single()

            if (error) {
                toast({
                    title: "Error fetching student",
                    description: error.message,
                    variant: "destructive",
                })
                router.push("/faculty/students")
                return
            }

            setStudentData(student)

            // Fetch feedback history
            const { data: feedbackData } = await supabase
                .from("feedback")
                .select(
                    `
          id,
          text,
          rating,
          created_at,
          subjects(name, code)
        `,
                )
                .eq("faculty_id", facultyData.id)
                .eq("student_id", params.id)
                .order("created_at", { ascending: false })

            setFeedbackHistory(feedbackData || [])
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!studentData) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <p className="text-lg text-muted-foreground">Student not found</p>
                <Button asChild>
                    <Link href="/faculty/students">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Students
                    </Link>
                </Button>
            </div>
        )
    }

    const userInitials = studentData.users.name
        ? studentData.users.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
        : "S"

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/faculty/students">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{studentData.users.name}</h1>
                    <p className="text-muted-foreground">Student Profile</p>
                </div>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
                <Card className="md:w-1/3">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Student information</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src="/placeholder.svg" alt={studentData.users.name} />
                            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-xl font-medium">{studentData.users.name}</h3>
                            <p className="text-sm text-muted-foreground">{studentData.users.email}</p>
                            {studentData.department && (
                                <p className="mt-1 text-sm">
                                    {studentData.department} • Year {studentData.year}
                                </p>
                            )}
                            {studentData.category && (
                                <div className="mt-2">
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{studentData.category}</Badge>
                                </div>
                            )}
                        </div>

                        {studentData.bio && (
                            <div className="w-full pt-4">
                                <h4 className="mb-2 font-medium">Bio</h4>
                                <p className="text-sm text-muted-foreground">{studentData.bio}</p>
                            </div>
                        )}

                        {studentData.interests && (
                            <div className="w-full pt-2">
                                <h4 className="mb-2 font-medium">Interests</h4>
                                <div className="flex flex-wrap gap-2">
                                    {studentData.interests.split(",").map((interest: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                            {interest.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex-1">
                    <Tabs defaultValue="skills" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="skills" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills & Proficiency</CardTitle>
                                    <CardDescription>Student's self-assessed skills</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {studentData.skills && Object.keys(studentData.skills).length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(studentData.skills).map(([skill, rating]: [string, any]) => (
                                                <div key={skill}>
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <span className="font-medium">{skill}</span>
                                                        <div className="flex items-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-4 w-4 ${star <= rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-300 dark:text-gray-600"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Progress value={(rating / 5) * 100} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No skills have been added by this student yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="feedback" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Feedback History</CardTitle>
                                        <CardDescription>Previous feedback provided to this student</CardDescription>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={`/faculty/feedback?student=${params.id}`}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Provide Feedback
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {feedbackHistory.length > 0 ? (
                                        <div className="space-y-4">
                                            {feedbackHistory.map((feedback) => (
                                                <div key={feedback.id} className="rounded-lg border p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium">
                                                            {feedback.subjects?.name} ({feedback.subjects?.code})
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(feedback.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-4 w-4 ${star <= feedback.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300 dark:text-gray-600"
                                                                    }`}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-sm">{feedback.rating}/5</span>
                                                    </div>
                                                    <p className="mt-2 text-sm">{feedback.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No feedback has been provided to this student yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
