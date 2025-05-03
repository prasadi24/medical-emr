"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDoctor, updateDoctor, type DoctorFormData } from "@/app/actions/doctor-actions"

type DoctorFormProps = {
    userId: string
    specialties: { id: number; name: string }[]
    employmentTypes: { id: number; name: string }[]
    clinics: { id: string; name: string }[]
    initialData?: {
        id: string
        user_id: string
        specialty_id: number | null
        license_number: string
        employment_type_id: number | null
        clinic_id: string | null
        consultation_fee: number | null
        education: string[] | null
        experience: number | null
        bio: string | null
        languages: string[] | null
        available_days: string[] | null
        available_hours: Record<string, { start: string; end: string }[]> | null
    }
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function DoctorForm({ userId, specialties, employmentTypes, clinics, initialData }: DoctorFormProps) {
    const isEditing = !!initialData
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [education, setEducation] = useState<string[]>(initialData?.education || [])
    const [newEducation, setNewEducation] = useState("")
    const [languages, setLanguages] = useState<string[]>(initialData?.languages || [])
    const [newLanguage, setNewLanguage] = useState("")

    const [formData, setFormData] = useState<DoctorFormData>({
        userId: initialData?.user_id || userId,
        specialtyId: initialData?.specialty_id || undefined,
        licenseNumber: initialData?.license_number || "",
        employmentTypeId: initialData?.employment_type_id || undefined,
        clinicId: initialData?.clinic_id || undefined,
        consultationFee: initialData?.consultation_fee || undefined,
        education: initialData?.education || [],
        experience: initialData?.experience || undefined,
        bio: initialData?.bio || "",
        languages: initialData?.languages || [],
        availableDays: initialData?.available_days || [],
        availableHours: initialData?.available_hours || {},
    })

    const handleChange = (field: keyof DoctorFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleDayToggle = (day: string) => {
        setFormData((prev) => {
            const availableDays = [...(prev.availableDays || [])]
            if (availableDays.includes(day)) {
                return { ...prev, availableDays: availableDays.filter((d) => d !== day) }
            } else {
                return { ...prev, availableDays: [...availableDays, day] }
            }
        })
    }

    const addEducation = () => {
        if (newEducation.trim()) {
            const updatedEducation = [...education, newEducation.trim()]
            setEducation(updatedEducation)
            setFormData((prev) => ({ ...prev, education: updatedEducation }))
            setNewEducation("")
        }
    }

    const removeEducation = (index: number) => {
        const updatedEducation = education.filter((_, i) => i !== index)
        setEducation(updatedEducation)
        setFormData((prev) => ({ ...prev, education: updatedEducation }))
    }

    const addLanguage = () => {
        if (newLanguage.trim()) {
            const updatedLanguages = [...languages, newLanguage.trim()]
            setLanguages(updatedLanguages)
            setFormData((prev) => ({ ...prev, languages: updatedLanguages }))
            setNewLanguage("")
        }
    }

    const removeLanguage = (index: number) => {
        const updatedLanguages = languages.filter((_, i) => i !== index)
        setLanguages(updatedLanguages)
        setFormData((prev) => ({ ...prev, languages: updatedLanguages }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = isEditing ? await updateDoctor(initialData.id, formData) : await createDoctor(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                router.push(isEditing ? `/doctors/${initialData.id}` : "/doctors")
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError("An unexpected error occurred")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? "Edit Doctor Profile" : "Create Doctor Profile"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="specialtyId">Specialty</Label>
                            <Select
                                value={formData.specialtyId?.toString() || ""}
                                onValueChange={(value) => handleChange("specialtyId", value ? Number.parseInt(value) : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.map((specialty) => (
                                        <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                            {specialty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                                id="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="employmentTypeId">Employment Type</Label>
                            <Select
                                value={formData.employmentTypeId?.toString() || ""}
                                onValueChange={(value) => handleChange("employmentTypeId", value ? Number.parseInt(value) : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employmentTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clinicId">Primary Clinic</Label>
                            <Select
                                value={formData.clinicId || ""}
                                onValueChange={(value) => handleChange("clinicId", value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select clinic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics.map((clinic) => (
                                        <SelectItem key={clinic.id} value={clinic.id}>
                                            {clinic.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                            <Input
                                id="consultationFee"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.consultationFee || ""}
                                onChange={(e) =>
                                    handleChange("consultationFee", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                type="number"
                                min="0"
                                value={formData.experience || ""}
                                onChange={(e) =>
                                    handleChange("experience", e.target.value ? Number.parseInt(e.target.value) : undefined)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio || ""}
                            onChange={(e) => handleChange("bio", e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Education</Label>
                        <div className="flex flex-wrap gap-2">
                            {education.map((edu, index) => (
                                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                                    <span className="mr-2">{edu}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() => removeEducation(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add education (e.g., MD Harvard Medical School)"
                                value={newEducation}
                                onChange={(e) => setNewEducation(e.target.value)}
                            />
                            <Button type="button" size="icon" onClick={addEducation}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-2">
                            {languages.map((lang, index) => (
                                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                                    <span className="mr-2">{lang}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() => removeLanguage(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add language (e.g., English, Spanish)"
                                value={newLanguage}
                                onChange={(e) => setNewLanguage(e.target.value)}
                            />
                            <Button type="button" size="icon" onClick={addLanguage}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Available Days</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <Button
                                    key={day}
                                    type="button"
                                    variant={formData.availableDays?.includes(day) ? "default" : "outline"}
                                    onClick={() => handleDayToggle(day)}
                                    className="rounded-full"
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
