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
import { AlertCircle, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClinic, updateClinic, type ClinicFormData } from "@/app/actions/clinic-actions"

type ClinicFormProps = {
    initialData?: {
        id: string
        name: string
        address: string
        phone_number: string
        email: string | null
        website: string | null
        opening_hours: Record<string, { open: string; close: string }> | null
        facilities: string[] | null
    }
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function ClinicForm({ initialData }: ClinicFormProps) {
    const isEditing = !!initialData
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [facilities, setFacilities] = useState<string[]>(initialData?.facilities || [])
    const [newFacility, setNewFacility] = useState("")

    const [formData, setFormData] = useState<ClinicFormData>({
        name: initialData?.name || "",
        address: initialData?.address || "",
        phoneNumber: initialData?.phone_number || "",
        email: initialData?.email || "",
        website: initialData?.website || "",
        openingHours: initialData?.opening_hours || {},
        facilities: initialData?.facilities || [],
    })

    const handleChange = (field: keyof ClinicFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleOpeningHoursChange = (day: string, type: "open" | "close", value: string) => {
        setFormData((prev) => {
            const openingHours = { ...(prev.openingHours || {}) }
            if (!openingHours[day]) {
                openingHours[day] = { open: "09:00", close: "17:00" }
            }
            openingHours[day][type] = value
            return { ...prev, openingHours }
        })
    }

    const addFacility = () => {
        const trimmedFacility = newFacility.trim()
        if (trimmedFacility.length > 0) {
            const updatedFacilities = [...facilities, trimmedFacility]
            setFacilities(updatedFacilities)
            setFormData((prev) => ({ ...prev, facilities: updatedFacilities }))
            setNewFacility("")
        }
    }

    const removeFacility = (index: number) => {
        const updatedFacilities = facilities.filter((_, i) => i !== index)
        setFacilities(updatedFacilities)
        setFormData((prev) => ({ ...prev, facilities: updatedFacilities }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = isEditing ? await updateClinic(initialData.id, formData) : await createClinic(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                router.push(isEditing ? `/clinics/${initialData.id}` : "/clinics")
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
                    <CardTitle>{isEditing ? "Edit Clinic" : "Add New Clinic"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Clinic Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={formData.website || ""}
                            onChange={(e) => handleChange("website", e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Opening Hours</Label>
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className="grid grid-cols-3 gap-4 items-center">
                                <div className="font-medium">{day}</div>
                                <div>
                                    <Input
                                        type="time"
                                        value={formData.openingHours?.[day]?.open || "09:00"}
                                        onChange={(e) => handleOpeningHoursChange(day, "open", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="time"
                                        value={formData.openingHours?.[day]?.close || "17:00"}
                                        onChange={(e) => handleOpeningHoursChange(day, "close", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Label>Facilities</Label>
                        <div className="flex flex-wrap gap-2">
                            {facilities.map((facility, index) => (
                                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                                    <span className="mr-2">{facility}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() => removeFacility(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add facility (e.g., X-Ray, Laboratory)"
                                value={newFacility}
                                onChange={(e) => setNewFacility(e.target.value)}
                            />
                            <Button type="button" size="icon" onClick={addFacility}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update Clinic" : "Create Clinic"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
