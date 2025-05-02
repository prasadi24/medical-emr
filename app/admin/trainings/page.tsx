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

export default function AdminTrainingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [trainings, setTrainings] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Explorer",
        duration: "",
        level: "Beginner",
    })

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchTrainings()
    }, [user, router])

    const fetchTrainings = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from("trainings")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast({
                title: "Error fetching trainings",
                description: error.message,
                variant: "destructive",
            })
        } else {
            setTrainings(data || [])
        }

        setLoading(false)
    }

    const handleAddTraining = async () => {
        if (!formData.title || !formData.description) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        const { error } = await supabase.from("trainings").insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            duration: formData.duration,
            level: formData.level,
        })

        if (error) {
            toast({
                title: "Error adding training",
                description: error.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        toast({
            title: "Training added",
            description: "The training has been added successfully",
        })

        // Reset form and refresh data
        setFormData({
            title: "",
            description: "",
            category: "Explorer",
            duration: "",
            level: "Beginner",
        })
        setDialogOpen(false)
        fetchTrainings()
    }

    const filteredTrainings = trainings.filter(training =>
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (training.description && training.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        training.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trainings</h1>
                    <p className="text-muted-foreground">Manage training programs and resources</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Training
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Training</DialogTitle>
                            <DialogDescription>Create a new training program in the system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Training Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter training title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter training description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                            <SelectItem value="All">All Categories</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Select
                                        value={formData.level}
                                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    placeholder="Enter duration (e.g., 2 weeks, 10 hours)"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddTraining}>Add Training</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Trainings</CardTitle>
                    <CardDescription>View and manage all training programs in the system</CardDescription>
                    <div className="mt-4 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search trainings..."
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
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTrainings.length > 0 ? (
                                        filteredTrainings.map((training) => (
                                            <TableRow key={training.id}>
                                                <TableCell className="font-medium">{training.title}</TableCell>
                                                <TableCell>{training.category}</TableCell>
                                                <TableCell>{training.level}</TableCell>
                                                <TableCell>{training.duration || "Not specified"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/trainings/${training.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No trainings found.
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
