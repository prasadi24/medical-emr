"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Loader2, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function FacultyStudentsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [facultyId, setFacultyId] = useState<string | null>(null)
    const [subjects, setSubjects] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [filteredStudents, setFilteredStudents] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")

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
        // Filter students based on selected subject, category and search query
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

            // Apply category filter if selected
            if (selectedCategory) {
                filtered = filtered.filter((student) => student.category === selectedCategory)
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
    }, [selectedSubject, selectedCategory, searchQuery, students])

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
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <p className="text-muted-foreground">View and manage students in your courses</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full md:w-1/3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Filter students by various criteria</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Subjects</SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Explorer">Explorer</SelectItem>
                                        <SelectItem value="Doer">Doer</SelectItem>
                                        <SelectItem value="Achiever">Achiever</SelectItem>
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
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/faculty/students/${student.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </Link>
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
        </div>
    )
}
