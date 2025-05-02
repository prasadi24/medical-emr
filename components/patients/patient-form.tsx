"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createPatient, updatePatient, type PatientFormData } from "@/app/actions/patient-actions"

type PatientFormProps = {
    initialData?: {
        id: string
        first_name: string
        last_name: string
        date_of_birth: string
        gender: string
        blood_type: string | null
        address: string | null
        phone_number: string | null
        email: string | null
        emergency_contact_name: string | null
        emergency_contact_phone: string | null
        insurance_provider: string | null
        insurance_policy_number: string | null
    }
}

export function PatientForm({ initialData }: PatientFormProps) {
    const isEditing = !!initialData
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<PatientFormData>({
        firstName: initialData?.first_name || "",
        lastName: initialData?.last_name || "",
        dateOfBirth: initialData?.date_of_birth ? initialData.date_of_birth.split("T")[0] : "",
        gender: initialData?.gender || "",
        bloodType: initialData?.blood_type || "",
        address: initialData?.address || "",
        phoneNumber: initialData?.phone_number || "",
        email: initialData?.email || "",
        emergencyContactName: initialData?.emergency_contact_name || "",
        emergencyContactPhone: initialData?.emergency_contact_phone || "",
        insuranceProvider: initialData?.insurance_provider || "",
        insurancePolicyNumber: initialData?.insurance_policy_number || "",
    })

    const handleChange = (field: keyof PatientFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = isEditing ? await updatePatient(initialData.id, formData) : await createPatient(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                router.push(isEditing ? `/patients/${initialData.id}` : "/patients")
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
                    <CardTitle>{isEditing ? "Edit Patient" : "Add New Patient"}</CardTitle>
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
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select value={formData.bloodType || ""} onValueChange={(value) => handleChange("bloodType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber || ""}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                            />
                        </div>
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

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                            <Input
                                id="emergencyContactName"
                                value={formData.emergencyContactName || ""}
                                onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                            <Input
                                id="emergencyContactPhone"
                                value={formData.emergencyContactPhone || ""}
                                onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                            <Input
                                id="insuranceProvider"
                                value={formData.insuranceProvider || ""}
                                onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                            <Input
                                id="insurancePolicyNumber"
                                value={formData.insurancePolicyNumber || ""}
                                onChange={(e) => handleChange("insurancePolicyNumber", e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update Patient" : "Create Patient"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
