"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function TimeManagerPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState<any[]>([])
    const [studentId, setStudentId] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        dueDate: new Date(),
        priority: "medium",
    })

    useEffect(() => {
        async function fetchData() {
            if (!user) return

            // Get student ID
            const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).single()

            if (student) {
                setStudentId(student.id)

                // Fetch tasks
                const { data: tasksData } = await supabase
                    .from("tasks")
                    .select("*")
                    .eq("student_id", student.id)
                    .order("due_date")

                setTasks(tasksData || [])
            }

            setLoading(false)
        }

        fetchData()
    }, [user])

    const handleAddTask = async () => {
        if (!studentId) {
            toast({
                title: "Error",
                description: "Student profile not found",
                variant: "destructive",
            })
            return
        }

        if (!formData.title) {
            toast({
                title: "Missing title",
                description: "Please enter a task title",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                student_id: studentId,
                title: formData.title,
                due_date: formData.dueDate.toISOString(),
                priority: formData.priority,
                status: "pending",
            })
            .select()

        if (error) {
            toast({
                title: "Error adding task",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Task added",
                description: "Your task has been added successfully",
            })

            // Add new task to the list
            if (data) {
                setTasks([...tasks, data[0]])
            }

            // Reset form
            setFormData({
                title: "",
                dueDate: new Date(),
                priority: "medium",
            })

            setDialogOpen(false)
        }

        setLoading(false)
    }

    const handleToggleStatus = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === "pending" ? "completed" : "pending"

        const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)

        if (error) {
            toast({
                title: "Error updating task",
                description: error.message,
                variant: "destructive",
            })
        } else {
            // Update task in the list
            setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId)

        if (error) {
            toast({
                title: "Error deleting task",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Task deleted",
                description: "Your task has been deleted successfully",
            })

            // Remove task from the list
            setTasks(tasks.filter((task) => task.id !== taskId))
        }
    }

    if (loading && tasks.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Filter tasks by status
    const pendingTasks = tasks.filter((task) => task.status === "pending")
    const completedTasks = tasks.filter((task) => task.status === "completed")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Time Manager</h1>
                    <p className="text-muted-foreground">Organize your tasks and deadlines</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>Create a new task or deadline to keep track of your work.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter task title"
                                    value={formData.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dueDate}
                                            onSelect={(date: Date | undefined) => date && setFormData({ ...formData, dueDate: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: string) => setFormData({ ...formData, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddTask}>Add Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Tasks</CardTitle>
                            <CardDescription>Tasks that need to be completed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingTasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-1">
                                                <div className="font-medium">{task.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${task.priority === "high"
                                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                                : task.priority === "medium"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                            }`}
                                                    >
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(task.id, task.status)}>
                                                    Complete
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">
                                    No pending tasks. Add some to stay organized!
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Tasks</CardTitle>
                            <CardDescription>Tasks you have already completed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {completedTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {completedTasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between rounded-lg border p-4 opacity-70">
                                            <div className="space-y-1">
                                                <div className="font-medium line-through">{task.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(task.id, task.status)}>
                                                    Undo
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">No completed tasks yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
