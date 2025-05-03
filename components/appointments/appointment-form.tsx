"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createAppointment, updateAppointment, type AppointmentFormData } from "@/app/actions/appointment-actions"

type Patient = {
    id: string
    first_name: string
    last_name: string
}

type Doctor = {
    id: string
    user_id: string
    profile: {
        first_name: string | null
        last_name: string | null
    }
    specialty: {
        name: string
    } | null
}

type Clinic = {
    id: string
    name: string
}

type AppointmentFormProps = {
    patients: Patient[]
    doctors: Doctor[]
    clinics: Clinic[]
    initialData?: {
        id: string
        patient_id: string
        doctor_id: string
        clinic_id: string
        appointment_date: string
        duration: number
        status: string
        type: string
        reason: string | null
        notes: string | null
    }
    defaultPatientId?: string
}

const APPOINTMENT_TYPES = [
    "consultation",
    "follow-up",
    "check-up",
    "vaccination",
    "procedure",
    "lab-work",
    "imaging",
    "emergency",
    "other",
]

const APPOINTMENT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no-show"]

const APPOINTMENT_DURATIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
]

export function AppointmentForm({ patients, doctors, clinics, initialData, defaultPatientId }: AppointmentFormProps) {
    const isEditing = !!initialData
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Format the appointment date from ISO string to local datetime-local format
    const formatDateTimeForInput = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16) // YYYY-MM-DDThh:mm format
    }

    const [formData, setFormData] = useState<AppointmentFormData>({
        patientId: initialData?.patient_id || defaultPatientId || "",
        doctorId: initialData?.doctor_id || "",
        clinicId: initialData?.clinic_id || "",
        appointmentDate: initialData?.appointment_date ? formatDateTimeForInput(initialData.appointment_date) : "",
        duration: initialData?.duration || 30,
        status: initialData?.status || "scheduled",
        type: initialData?.type || "consultation",
        reason: initialData?.reason || "",
        notes: initialData?.notes || "",
    })

    const handleChange = (field: keyof AppointmentFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = isEditing ? await updateAppointment(initialData.id, formData) : await createAppointment(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                router.push(isEditing ? `/appointments/${initialData.id}` : "/appointments")
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

    const getCurrentDateTimeLocal = () => {
        const now = new Date()
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15) // Round up to nearest 15 minutes
        return now.toISOString().slice(0, 16) // Format to YYYY-MM-DDThh:mm
    }

    // If no appointment date is set, set it to the next available 15-minute slot
    useEffect(() => {
        if (!formData.appointmentDate) {
            setFormData((prev) => ({
                ...prev,
                appointmentDate: getCurrentDateTimeLocal(),
            }))
        }
    }, [])

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="patientId">Patient</Label>
                        <Select
                            value={formData.patientId}
                            onValueChange={(value) => handleChange("patientId", value)}
                            disabled={!!defaultPatientId || isEditing}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.first_name} {patient.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="doctorId">Doctor</Label>
                            <Select value={formData.doctorId} onValueChange={(value) => handleChange("doctorId", value)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.profile?.first_name} {doctor.profile?.last_name}
                                            {doctor.specialty && <span className="text-muted-foreground"> - {doctor.specialty.name}</span>}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clinicId">Clinic</Label>
                            <Select value={formData.clinicId} onValueChange={(value) => handleChange("clinicId", value)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a clinic" />
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
                            <Label htmlFor="appointmentDate">Date & Time</Label>
                            <Input
                                id="appointmentDate"
                                type="datetime-local"
                                value={formData.appointmentDate}
                                onChange={(e) => handleChange("appointmentDate", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Select
                                value={formData.duration.toString()}
                                onValueChange={(value) => handleChange("duration", Number.parseInt(value, 10))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPOINTMENT_DURATIONS.map((duration) => (
                                        <SelectItem key={duration.value} value={duration.value.toString()}>
                                            {duration.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Appointment Type</Label>
                            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPOINTMENT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            <span className="capitalize">{type.replace("-", " ")}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPOINTMENT_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            <span className="capitalize">{status.replace("-", " ")}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Visit</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason || ""}
                            onChange={(e) => handleChange("reason", e.target.value)}
                            placeholder="Brief description of the reason for this appointment"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Any additional information or special instructions"
                            rows={3}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update Appointment" : "Schedule Appointment"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
