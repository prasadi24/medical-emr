"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminStudentsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        year: "1",
        category: "Explorer",
    })

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchStudents()
    }, [user, router])

    const fetchStudents = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from("students")
            .select(`
        id,
        department,
        year,
        category,
        users (
          id,
          name,
          email
        )
      `)
            .order("users(name)")

        if (error) {
            toast({
                title: "Error fetching students",
                description: error.message,
                variant: "destructive",
            })
        } else {
            setStudents(data || [])
        }

        setLoading(false)
    }

    const handleAddStudent = async () => {
        if (!formData.name || !formData.email) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        // First create the user
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: "temppassword123", // This would be replaced with a random password in production
            email_confirm: true,
        })

        if (userError) {
            toast({
                title: "Error creating user",
                description: userError.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        // Add user to users table
        const { error: userTableError } = await supabase.from("users").insert({
            id: userData.user.id,
            email: formData.email,
            name: formData.name,
            role: "student",
        })

        if (userTableError) {
            toast({
                title: "Error adding user to database",
                description: userTableError.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        // Add student to students table
        const { error: studentError } = await supabase.from("students").insert({
            user_id: userData.user.id,
            department: formData.department,
            year: parseInt(formData.year),
            category: formData.category,
        })

        if (studentError) {
            toast({
                title: "Error adding student",
                description: studentError.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        toast({
            title: "Student added",
            description: "The student has been added successfully",
        })

        // Reset form and refresh data
        setFormData({
            name: "",
            email: "",
            department: "",
            year: "1",
            category: "Explorer",
        })
        setDialogOpen(false)
        fetchStudents()
    }

    const filteredStudents = students.filter(student =>
        student.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.department && student.department.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground">Manage student accounts and information</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>Create a new student account in the system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter student name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter student email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    placeholder="Enter department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Select
                                        value={formData.year}
                                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">First Year</SelectItem>
                                            <SelectItem value="2">Second Year</SelectItem>
                                            <SelectItem value="3">Third Year</SelectItem>
                                            <SelectItem value="4">Fourth Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Explorer">Explorer</SelectItem>
                                            <SelectItem value="Doer">Doer</SelectItem>
                                            <SelectItem value="Achiever">Achiever</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddStudent}>Add Student</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Students</CardTitle>
                    <CardDescription>View and manage all students in the system</CardDescription>
                    <div className="mt-4 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
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
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.users.name}</TableCell>
                                                <TableCell>{student.users.email}</TableCell>
                                                <TableCell>{student.department || "Not set"}</TableCell>
                                                <TableCell>{student.year || "Not set"}</TableCell>
                                                <TableCell>{student.category || "Not assigned"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/students/${student.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No students found.
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
