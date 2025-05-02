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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSubjectsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [subjects, setSubjects] = useState<any[]>([])
    const [faculty, setFaculty] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        facultyId: "",
        credits: "3",
    })

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchData()
    }, [user, router])

    const fetchData = async () => {
        setLoading(true)

        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
            .from("subjects")
            .select(`
        id,
        name,
        code,
        description,
        credits,
        faculty_id,
        faculty (
          id,
          users (
            name
          )
        )
      `)
            .order("name")

        if (subjectsError) {
            toast({
                title: "Error fetching subjects",
                description: subjectsError.message,
                variant: "destructive",
            })
        } else {
            setSubjects(subjectsData || [])
        }

        // Fetch faculty for dropdown
        const { data: facultyData, error: facultyError } = await supabase
            .from("faculty")
            .select(`
        id,
        users (
          name
        )
      `)
            .order("users(name)")

        if (facultyError) {
            toast({
                title: "Error fetching faculty",
                description: facultyError.message,
                variant: "destructive",
            })
        } else {
            setFaculty(facultyData || [])
        }

        setLoading(false)
    }

    const handleAddSubject = async () => {
        if (!formData.name || !formData.code) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        const { error } = await supabase.from("subjects").insert({
            name: formData.name,
            code: formData.code,
            description: formData.description,
            faculty_id: formData.facultyId || null,
            credits: parseInt(formData.credits),
        })

        if (error) {
            toast({
                title: "Error adding subject",
                description: error.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        toast({
            title: "Subject added",
            description: "The subject has been added successfully",
        })

        // Reset form and refresh data
        setFormData({
            name: "",
            code: "",
            description: "",
            facultyId: "",
            credits: "3",
        })
        setDialogOpen(false)
        fetchData()
    }

    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
                    <p className="text-muted-foreground">Manage courses and subjects</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subject
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Subject</DialogTitle>
                            <DialogDescription>Create a new subject or course in the system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Subject Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter subject name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Subject Code</Label>
                                <Input
                                    id="code"
                                    placeholder="Enter subject code (e.g., CS101)"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter subject description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="faculty">Assigned Faculty</Label>
                                    <Select
                                        value={formData.facultyId}
                                        onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select faculty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {faculty.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.users.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="credits">Credits</Label>
                                    <Select
                                        value={formData.credits}
                                        onValueChange={(value) => setFormData({ ...formData, credits: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select credits" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Credit</SelectItem>
                                            <SelectItem value="2">2 Credits</SelectItem>
                                            <SelectItem value="3">3 Credits</SelectItem>
                                            <SelectItem value="4">4 Credits</SelectItem>
                                            <SelectItem value="5">5 Credits</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddSubject}>Add Subject</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Subjects</CardTitle>
                    <CardDescription>View and manage all subjects in the system</CardDescription>
                    <div className="mt-4 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subjects..."
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
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.code}</TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell>{subject.credits}</TableCell>
                                                <TableCell>{subject.faculty?.users?.name || "Not assigned"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/subjects/${subject.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No subjects found.
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
