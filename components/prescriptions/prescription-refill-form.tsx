"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createPrescriptionRefill } from "@/app/actions/prescription-actions"

const refillSchema = z.object({
    prescriptionId: z.string(),
    refillAmount: z.string().min(1, "Refill amount is required"),
    authorizedById: z.string(),
    pharmacyId: z.string().optional(),
    notes: z.string().optional(),
})

type RefillFormValues = z.infer<typeof refillSchema>

interface PrescriptionRefillFormProps {
    prescription: any
    authorizedById: string
    pharmacies: any[]
}

export function PrescriptionRefillForm({ prescription, authorizedById, pharmacies }: PrescriptionRefillFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: Partial<RefillFormValues> = {
        prescriptionId: prescription.id,
        refillAmount: "30 days",
        authorizedById: authorizedById,
        pharmacyId: "",
        notes: "",
    }

    const form = useForm<RefillFormValues>({
        resolver: zodResolver(refillSchema),
        defaultValues,
    })

    const onSubmit = async (data: RefillFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append("prescriptionId", data.prescriptionId)
            formData.append("refillAmount", data.refillAmount)
            formData.append("authorizedById", data.authorizedById)
            if (data.pharmacyId) formData.append("pharmacyId", data.pharmacyId)
            formData.append("notes", data.notes || "")

            await createPrescriptionRefill(formData)
            toast({
                title: "Refill created",
                description: "The prescription refill has been created successfully.",
            })

            router.push(`/medical-records/${prescription.medical_record_id}`)
        } catch (error) {
            console.error("Error submitting refill:", error)
            toast({
                title: "Error",
                description: "Failed to create refill. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <h3 className="font-medium text-lg mb-2">Prescription Details</h3>
                    <p>
                        <strong>Medication:</strong> {prescription.medication_name}
                    </p>
                    <p>
                        <strong>Dosage:</strong> {prescription.dosage}
                    </p>
                    <p>
                        <strong>Frequency:</strong> {prescription.frequency}
                    </p>
                    <p>
                        <strong>Original Duration:</strong> {prescription.duration}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="refillAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Refill Amount</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 30 days" {...field} />
                            </FormControl>
                            <FormDescription>Specify the duration or quantity for this refill</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {pharmacies.length > 0 && (
                    <FormField
                        control={form.control}
                        name="pharmacyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pharmacy</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pharmacy (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {pharmacies.map((pharmacy) => (
                                            <SelectItem key={pharmacy.id} value={pharmacy.id}>
                                                {pharmacy.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Select a pharmacy for this refill (optional)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Additional notes for this refill" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Refill"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
