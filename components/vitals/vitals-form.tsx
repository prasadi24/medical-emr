"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createVitals, type VitalsFormData } from "@/app/actions/vitals-actions"

type VitalsFormProps = {
    medicalRecordId: string
}

export function VitalsForm({ medicalRecordId }: VitalsFormProps) {
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState<VitalsFormData>({
        medicalRecordId,
        temperature: undefined,
        heartRate: undefined,
        respiratoryRate: undefined,
        bloodPressureSystolic: undefined,
        bloodPressureDiastolic: undefined,
        oxygenSaturation: undefined,
        height: undefined,
        weight: undefined,
        notes: "",
    })

    const handleChange = (field: keyof VitalsFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value === "" ? undefined : field === "notes" ? value : Number(value),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await createVitals(formData)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setSuccess(true)
                // Reset form
                setFormData({
                    medicalRecordId,
                    temperature: undefined,
                    heartRate: undefined,
                    respiratoryRate: undefined,
                    bloodPressureSystolic: undefined,
                    bloodPressureDiastolic: undefined,
                    oxygenSaturation: undefined,
                    height: undefined,
                    weight: undefined,
                    notes: "",
                })
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
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <AlertDescription>Vitals recorded successfully.</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={formData.temperature || ""}
                        onChange={(e) => handleChange("temperature", e.target.value)}
                        placeholder="98.6"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                        id="heartRate"
                        type="number"
                        value={formData.heartRate || ""}
                        onChange={(e) => handleChange("heartRate", e.target.value)}
                        placeholder="80"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="respiratoryRate">Respiratory Rate (bpm)</Label>
                    <Input
                        id="respiratoryRate"
                        type="number"
                        value={formData.respiratoryRate || ""}
                        onChange={(e) => handleChange("respiratoryRate", e.target.value)}
                        placeholder="16"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bloodPressureSystolic">Blood Pressure - Systolic (mmHg)</Label>
                    <Input
                        id="bloodPressureSystolic"
                        type="number"
                        value={formData.bloodPressureSystolic || ""}
                        onChange={(e) => handleChange("bloodPressureSystolic", e.target.value)}
                        placeholder="120"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bloodPressureDiastolic">Blood Pressure - Diastolic (mmHg)</Label>
                    <Input
                        id="bloodPressureDiastolic"
                        type="number"
                        value={formData.bloodPressureDiastolic || ""}
                        onChange={(e) => handleChange("bloodPressureDiastolic", e.target.value)}
                        placeholder="80"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                    <Input
                        id="oxygenSaturation"
                        type="number"
                        value={formData.oxygenSaturation || ""}
                        onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
                        placeholder="98"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={formData.height || ""}
                        onChange={(e) => handleChange("height", e.target.value)}
                        placeholder="170"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight || ""}
                        onChange={(e) => handleChange("weight", e.target.value)}
                        placeholder="70"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Additional observations or notes"
                    rows={3}
                />
            </div>

            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Recording..." : "Record Vitals"}
            </Button>
        </form>
    )
}
