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

export default function AdminFacultyPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [faculty, setFaculty] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        specialization: "",
    })

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchFaculty()
    }, [user, router])

    const fetchFaculty = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from("faculty")
            .select(`
        id,
        department,
        specialization,
        users (
          id,
          name,
          email
        )
      `)
            .order("users(name)")

        if (error) {
            toast({
                title: "Error fetching faculty",
                description: error.message,
                variant: "destructive",
            })
        } else {
            setFaculty(data || [])
        }

        setLoading(false)
    }

    const handleAddFaculty = async () => {
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
            role: "faculty",
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

        // Add faculty to faculty table
        const { error: facultyError } = await supabase.from("faculty").insert({
            user_id: userData.user.id,
            department: formData.department,
            specialization: formData.specialization,
        })

        if (facultyError) {
            toast({
                title: "Error adding faculty",
                description: facultyError.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        toast({
            title: "Faculty added",
            description: "The faculty member has been added successfully",
        })

        // Reset form and refresh data
        setFormData({
            name: "",
            email: "",
            department: "",
            specialization: "",
        })
        setDialogOpen(false)
        fetchFaculty()
    }

    const filteredFaculty = faculty.filter(f =>
        f.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.department && f.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.specialization && f.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
                    <p className="text-muted-foreground">Manage faculty accounts and information</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Faculty
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Faculty</DialogTitle>
                            <DialogDescription>Create a new faculty account in the system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter faculty name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter faculty email"
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
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    placeholder="Enter specialization"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddFaculty}>Add Faculty</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Faculty</CardTitle>
                    <CardDescription>View and manage all faculty members in the system</CardDescription>
                    <div className="mt-4 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search faculty..."
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
                                        <TableHead>Specialization</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFaculty.length > 0 ? (
                                        filteredFaculty.map((f) => (
                                            <TableRow key={f.id}>
                                                <TableCell className="font-medium">{f.users.name}</TableCell>
                                                <TableCell>{f.users.email}</TableCell>
                                                <TableCell>{f.department || "Not set"}</TableCell>
                                                <TableCell>{f.specialization || "Not set"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/faculty/${f.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No faculty found.
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
