"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createPrescription, updatePrescription } from "@/app/actions/prescription-actions"

const prescriptionSchema = z.object({
    id: z.string().optional(),
    medicalRecordId: z.string(),
    doctorId: z.string(),
    medicationName: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required"),
    instructions: z.string().optional(),
    status: z.string(),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
    prescription?: any
    medicalRecordId: string
    doctorId: string
    isEdit?: boolean
}

export function PrescriptionForm({ prescription, medicalRecordId, doctorId, isEdit = false }: PrescriptionFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: Partial<PrescriptionFormValues> = {
        id: prescription?.id || undefined,
        medicalRecordId: medicalRecordId,
        doctorId: doctorId,
        medicationName: prescription?.medication_name || "",
        dosage: prescription?.dosage || "",
        frequency: prescription?.frequency || "",
        duration: prescription?.duration || "",
        instructions: prescription?.instructions || "",
        status: prescription?.status || "active",
    }

    const form = useForm<PrescriptionFormValues>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues,
    })

    const onSubmit = async (data: PrescriptionFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            if (isEdit && data.id) {
                formData.append("id", data.id)
            }

            formData.append("medicalRecordId", data.medicalRecordId)
            formData.append("doctorId", data.doctorId)
            formData.append("medicationName", data.medicationName)
            formData.append("dosage", data.dosage)
            formData.append("frequency", data.frequency)
            formData.append("duration", data.duration)
            formData.append("instructions", data.instructions || "")
            formData.append("status", data.status)

            if (isEdit) {
                await updatePrescription(formData)
                toast({
                    title: "Prescription updated",
                    description: "The prescription has been updated successfully.",
                })
            } else {
                await createPrescription(formData)
                toast({
                    title: "Prescription created",
                    description: "The prescription has been created successfully.",
                })
            }

            router.push(`/medical-records/${medicalRecordId}`)
        } catch (error) {
            console.error("Error submitting prescription:", error)
            toast({
                title: "Error",
                description: "Failed to save prescription. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="medicationName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter medication name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 10mg" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Twice daily" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 7 days" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Special instructions for the patient" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : isEdit ? "Update Prescription" : "Create Prescription"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
