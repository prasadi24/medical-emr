"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function FacultyFeedbackPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [facultyId, setFacultyId] = useState<string | null>(null)
    const [subjects, setSubjects] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [filteredStudents, setFilteredStudents] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [feedbackText, setFeedbackText] = useState<string>("")
    const [feedbackRating, setFeedbackRating] = useState<number>(5)
    const [submitting, setSubmitting] = useState(false)
    const [feedbackHistory, setFeedbackHistory] = useState<any[]>([])

    useEffect(() => {
        if (user?.role !== "faculty") {
            router.push("/")
            return
        }

        fetchData()
    }, [user, router])

    const fetchData = async () => {
        setLoading(true)

        if (!user) return

        // Get faculty ID
        const { data: facultyData } = await supabase.from("faculty").select("id").eq("user_id", user.id).single()

        if (facultyData) {
            setFacultyId(facultyData.id)

            // Fetch subjects taught by this faculty
            const { data: subjectsData } = await supabase
                .from("subjects")
                .select("id, name, code")
                .contains("faculty_ids", [facultyData.id])
                .order("name")

            setSubjects(subjectsData || [])

            // Fetch all students
            const { data: studentsData } = await supabase
                .from("students")
                .select(
                    `
          id, 
          department, 
          year, 
          category,
          skills,
          users (
            id, 
            name, 
            email
          )
        `,
                )
                .order("users(name)")

            setStudents(studentsData || [])
            setFilteredStudents(studentsData || [])
        }

        setLoading(false)
    }

    useEffect(() => {
        // Filter students based on selected subject and search query
        if (students.length > 0) {
            let filtered = [...students]

            // Apply subject filter if selected
            if (selectedSubject) {
                // In a real app, you would filter students enrolled in the selected subject
                // This is a placeholder implementation
                filtered = filtered.filter((student) => {
                    // Assuming there's a student_subjects table or a subjects array in student
                    return true // Replace with actual filtering logic
                })
            }

            // Apply search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                filtered = filtered.filter(
                    (student) =>
                        student.users.name.toLowerCase().includes(query) ||
                        student.users.email.toLowerCase().includes(query) ||
                        (student.department && student.department.toLowerCase().includes(query)),
                )
            }

            setFilteredStudents(filtered)
        }
    }, [selectedSubject, searchQuery, students])

    const handleOpenFeedbackDialog = async (student: any) => {
        setSelectedStudent(student)
        setFeedbackText("")
        setFeedbackRating(5)

        // Fetch previous feedback for this student from this faculty
        if (facultyId) {
            const { data: feedbackData } = await supabase
                .from("feedback")
                .select("*")
                .eq("faculty_id", facultyId)
                .eq("student_id", student.id)
                .order("created_at", { ascending: false })

            setFeedbackHistory(feedbackData || [])
        }

        setFeedbackDialogOpen(true)
    }

    const handleSubmitFeedback = async () => {
        if (!facultyId || !selectedStudent) {
            toast({
                title: "Error",
                description: "Missing faculty or student information",
                variant: "destructive",
            })
            return
        }

        if (!feedbackText) {
            toast({
                title: "Missing feedback",
                description: "Please enter feedback text",
                variant: "destructive",
            })
            return
        }

        setSubmitting(true)

        // Get the first subject as default if none selected
        const subjectId = selectedSubject || (subjects.length > 0 ? subjects[0].id : null)

        if (!subjectId) {
            toast({
                title: "Error",
                description: "No subject available",
                variant: "destructive",
            })
            setSubmitting(false)
            return
        }

        const { error } = await supabase.from("feedback").insert({
            faculty_id: facultyId,
            student_id: selectedStudent.id,
            subject_id: subjectId,
            text: feedbackText,
            rating: feedbackRating,
        })

        if (error) {
            toast({
                title: "Error submitting feedback",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Feedback submitted",
                description: "Your feedback has been submitted successfully",
            })

            // Add to feedback history
            setFeedbackHistory([
                {
                    faculty_id: facultyId,
                    student_id: selectedStudent.id,
                    subject_id: subjectId,
                    text: feedbackText,
                    rating: feedbackRating,
                    created_at: new Date().toISOString(),
                },
                ...feedbackHistory,
            ])

            // Reset form
            setFeedbackText("")
            setFeedbackDialogOpen(false)
        }

        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Feedback</h1>
                <p className="text-muted-foreground">Provide feedback to students in your courses</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full md:w-1/3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Filter students by subject or search</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, or department"
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                            <CardDescription>
                                {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredStudents.map((student) => (
                                        <div key={student.id} className="flex items-start justify-between rounded-lg border p-4">
                                            <div className="flex gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src="/placeholder.svg" alt={student.users.name} />
                                                    <AvatarFallback>
                                                        {student.users.name
                                                            .split(" ")
                                                            .map((n: string) => n[0])
                                                            .join("")
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium">{student.users.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{student.users.email}</p>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {student.department && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {student.department}
                                                            </Badge>
                                                        )}
                                                        {student.year && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Year {student.year}
                                                            </Badge>
                                                        )}
                                                        {student.category && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {student.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => handleOpenFeedbackDialog(student)}>
                                                Provide Feedback
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No students found. Try adjusting your filters.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Provide Feedback</DialogTitle>
                        <DialogDescription>
                            {selectedStudent && `Providing feedback for ${selectedStudent.users.name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="new">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="new">New Feedback</TabsTrigger>
                            <TabsTrigger value="history">Feedback History ({feedbackHistory.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id || ""}>
                                                {subject.name} ({subject.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Feedback</label>
                                <Textarea
                                    placeholder="Provide your feedback here..."
                                    rows={5}
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            className="focus:outline-none"
                                            onClick={() => setFeedbackRating(rating)}
                                        >
                                            <Star
                                                className={`h-6 w-6 ${rating <= feedbackRating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">{feedbackRating}/5</span>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="history" className="space-y-4 pt-4">
                            {feedbackHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {feedbackHistory.map((feedback, index) => (
                                        <div key={index} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">
                                                    Feedback on {new Date(feedback.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= feedback.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300 dark:text-gray-600"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm">{feedback.text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">No previous feedback for this student.</div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitFeedback} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Feedback"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
