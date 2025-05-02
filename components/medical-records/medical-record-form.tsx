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
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    createMedicalRecord,
    updateMedicalRecord,
    type MedicalRecordFormData,
} from "@/app/actions/medical-record-actions"

type MedicalRecordFormProps = {
    patientId: string
    initialData?: {
        id: string
        patient_id: string
        chief_complaint: string
        diagnosis: string | null
        treatment_plan: string | null
        notes: string | null
        follow_up_date: string | null
    }
}

export function MedicalRecordForm({ patientId, initialData }: MedicalRecordFormProps) {
    const isEditing = !!initialData
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<MedicalRecordFormData>({
        patientId: patientId,
        chiefComplaint: initialData?.chief_complaint || "",
        diagnosis: initialData?.diagnosis || "",
        treatmentPlan: initialData?.treatment_plan || "",
        notes: initialData?.notes || "",
        followUpDate: initialData?.follow_up_date ? initialData.follow_up_date.split("T")[0] : "",
    })

    const handleChange = (field: keyof MedicalRecordFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = isEditing
                ? await updateMedicalRecord(initialData.id, formData)
                : await createMedicalRecord(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                router.push(isEditing ? `/medical-records/${initialData.id}` : `/patients/${patientId}?tab=medical-records`)
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
                    <CardTitle>{isEditing ? "Edit Medical Record" : "Create Medical Record"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                        <Textarea
                            id="chiefComplaint"
                            value={formData.chiefComplaint}
                            onChange={(e) => handleChange("chiefComplaint", e.target.value)}
                            required
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            value={formData.diagnosis || ""}
                            onChange={(e) => handleChange("diagnosis", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                        <Textarea
                            id="treatmentPlan"
                            value={formData.treatmentPlan || ""}
                            onChange={(e) => handleChange("treatmentPlan", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                            id="followUpDate"
                            type="date"
                            value={formData.followUpDate || ""}
                            onChange={(e) => handleChange("followUpDate", e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update Record" : "Create Record"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
