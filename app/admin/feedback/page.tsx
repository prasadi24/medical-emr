"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Star } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminFeedbackPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterSubject, setFilterSubject] = useState("")
    const [filterFaculty, setFilterFaculty] = useState("")
    const [subjects, setSubjects] = useState<any[]>([])
    const [faculty, setFaculty] = useState<any[]>([])

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchData()
    }, [user, router])

    const fetchData = async () => {
        setLoading(true)

        // Fetch feedback
        const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select(`
        id,
        text,
        rating,
        created_at,
        students (
          id,
          users (
            name
          )
        ),
        faculty (
          id,
          users (
            name
          )
        ),
        subjects (
          id,
          name,
          code
        )
      `)
            .order("created_at", { ascending: false })

        if (feedbackError) {
            toast({
                title: "Error fetching feedback",
                description: feedbackError.message,
                variant: "destructive",
            })
        } else {
            setFeedback(feedbackData || [])
        }

        // Fetch subjects for filter
        const { data: subjectsData } = await supabase
            .from("subjects")
            .select("id, name, code")
            .order("name")

        setSubjects(subjectsData || [])

        // Fetch faculty for filter
        const { data: facultyData } = await supabase
            .from("faculty")
            .select("id, users(name)")
            .order("users(name)")

        setFaculty(facultyData || [])

        setLoading(false)
    }

    const filteredFeedback = feedback.filter(f => {
        // Apply search query
        const matchesSearch =
            (f.text && f.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (f.students?.users?.name && f.students.users.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (f.faculty?.users?.name && f.faculty.users.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (f.subjects?.name && f.subjects.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Apply subject filter
        const matchesSubject = !filterSubject || f.subjects?.id === filterSubject;

        // Apply faculty filter
        const matchesFaculty = !filterFaculty || f.faculty?.id === filterFaculty;

        return matchesSearch && matchesSubject && matchesFaculty;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
                <p className="text-muted-foreground">View and analyze student feedback</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Feedback</CardTitle>
                    <CardDescription>Review feedback submitted by students</CardDescription>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search feedback..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by subject" />
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
                        <Select value={filterFaculty} onValueChange={setFilterFaculty}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Faculty</SelectItem>
                                {faculty.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.users.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFeedback.length > 0 ? (
                                        filteredFeedback.map((f) => (
                                            <TableRow key={f.id}>
                                                <TableCell>{f.students?.users?.name || "Anonymous"}</TableCell>
                                                <TableCell>{f.subjects ? `${f.subjects.name} (${f.subjects.code})` : "Unknown"}</TableCell>
                                                <TableCell>{f.faculty?.users?.name || "Not assigned"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        {f.rating}
                                                        <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/feedback/${f.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No feedback found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
