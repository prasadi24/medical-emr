"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkillsEditor } from "@/components/skills-editor"

export default function StudentProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [studentData, setStudentData] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        year: "",
        skills: {} as Record<string, number>,
        bio: "",
        interests: "",
        category: "",
    })

    useEffect(() => {
        if (user?.role !== "student") {
            router.push("/")
            return
        }

        fetchStudentData()
    }, [user, router])

    const fetchStudentData = async () => {
        if (!user) return

        setLoading(true)

        // Get student data
        const { data: student, error } = await supabase
            .from("students")
            .select("*, users(name, email)")
            .eq("user_id", user.id)
            .single()

        if (error) {
            toast({
                title: "Error fetching profile",
                description: error.message,
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        setStudentData(student)
        setFormData({
            name: student.users.name || "",
            email: student.users.email || "",
            department: student.department || "",
            year: student.year ? student.year.toString() : "",
            skills: student.skills || {},
            bio: student.bio || "",
            interests: student.interests || "",
            category: student.category || "",
        })

        setLoading(false)
    }

    const handleSaveProfile = async () => {
        if (!user) return

        setSaving(true)

        // Update user table
        const { error: userError } = await supabase
            .from("users")
            .update({
                name: formData.name,
            })
            .eq("id", user.id)

        if (userError) {
            toast({
                title: "Error updating profile",
                description: userError.message,
                variant: "destructive",
            })
            setSaving(false)
            return
        }

        // Update student table
        const { error: studentError } = await supabase
            .from("students")
            .update({
                department: formData.department,
                year: formData.year ? Number.parseInt(formData.year) : null,
                skills: formData.skills,
                bio: formData.bio,
                interests: formData.interests,
                category: formData.category,
            })
            .eq("user_id", user.id)

        if (studentError) {
            toast({
                title: "Error updating profile",
                description: studentError.message,
                variant: "destructive",
            })
            setSaving(false)
            return
        }

        toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
        })

        // Refresh user data in auth context
        if (user) {
            user.name = formData.name
        }

        setSaving(false)
    }

    const handleSkillsChange = (skills: Record<string, number>) => {
        setFormData({ ...formData, skills })
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const userInitials = formData.name
        ? formData.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "S"

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">View and update your profile information</p>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
                <Card className="md:w-1/3">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Your profile picture and basic information</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src="/placeholder.svg" alt={formData.name} />
                            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-xl font-medium">{formData.name}</h3>
                            <p className="text-sm text-muted-foreground">{formData.email}</p>
                            {formData.department && (
                                <p className="mt-1 text-sm">
                                    {formData.department} • Year {formData.year}
                                </p>
                            )}
                            {formData.category && (
                                <div className="mt-2">
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                        {formData.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex-1">
                    <Tabs defaultValue="personal" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                placeholder="e.g., Computer Science"
                                            />
                                        </div>
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="A short bio about yourself"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills & Interests</CardTitle>
                                    <CardDescription>Update your skills and learning preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Skills</Label>
                                        <SkillsEditor skills={formData.skills} onChange={handleSkillsChange} />
                                        <p className="text-xs text-muted-foreground">Add your skills and rate your proficiency from 1-5</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interests">Interests</Label>
                                        <Input
                                            id="interests"
                                            value={formData.interests}
                                            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                            placeholder="e.g., Machine Learning, Web Development, Data Science"
                                        />
                                        <p className="text-xs text-muted-foreground">Comma-separated list of your interests</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Learning Category</Label>
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
                                        <p className="text-xs text-muted-foreground">
                                            Your learning style category helps us personalize recommendations
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
