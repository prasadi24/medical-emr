"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { createLabResult, updateLabResult } from "@/app/actions/lab-result-actions"

const labResultSchema = z.object({
    patientId: z.string().min(1, "Patient is required"),
    medicalRecordId: z.string().optional(),
    labTestTypeId: z.string().min(1, "Lab test type is required"),
    orderedByDoctorId: z.string().min(1, "Ordering doctor is required"),
    performedByStaffId: z.string().optional(),
    testDate: z.date({
        required_error: "Test date is required",
    }),
    resultDate: z.date().optional(),
    result: z.string().optional(),
    unit: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
    isAbnormal: z.boolean().default(false),
})

type LabResultFormValues = z.infer<typeof labResultSchema>

interface LabResultFormProps {
    labResult?: any
    patients: any[]
    labTestTypes: any[]
    doctors: any[]
    staff: any[]
    patientId?: string
    medicalRecordId?: string
}

export function LabResultForm({
    labResult,
    patients,
    labTestTypes,
    doctors,
    staff,
    patientId,
    medicalRecordId,
}: LabResultFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: Partial<LabResultFormValues> = {
        patientId: patientId || labResult?.patient_id || "",
        medicalRecordId: medicalRecordId || labResult?.medical_record_id || "",
        labTestTypeId: labResult?.lab_test_type_id?.toString() || "",
        orderedByDoctorId: labResult?.ordered_by_doctor || "",
        performedByStaffId: labResult?.performed_by_staff || "",
        testDate: labResult?.test_date ? new Date(labResult.test_date) : new Date(),
        resultDate: labResult?.result_date ? new Date(labResult.result_date) : undefined,
        result: labResult?.result || "",
        unit: labResult?.unit || "",
        status: labResult?.status || "ordered",
        notes: labResult?.notes || "",
        isAbnormal: labResult?.is_abnormal || false,
    }

    const form = useForm<LabResultFormValues>({
        resolver: zodResolver(labResultSchema),
        defaultValues,
    })

    const onSubmit = async (data: LabResultFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append("patientId", data.patientId)
            if (data.medicalRecordId) {
                formData.append("medicalRecordId", data.medicalRecordId)
            }
            formData.append("labTestTypeId", data.labTestTypeId)
            formData.append("orderedByDoctorId", data.orderedByDoctorId)
            if (data.performedByStaffId) {
                formData.append("performedByStaffId", data.performedByStaffId)
            }
            formData.append("testDate", data.testDate.toISOString())
            if (data.resultDate) {
                formData.append("resultDate", data.resultDate.toISOString())
            }
            if (data.result) {
                formData.append("result", data.result)
            }
            if (data.unit) {
                formData.append("unit", data.unit)
            }
            formData.append("status", data.status)
            if (data.notes) {
                formData.append("notes", data.notes)
            }
            formData.append("isAbnormal", data.isAbnormal.toString())

            if (labResult) {
                await updateLabResult(labResult.id, formData)
                toast({
                    title: "Lab result updated",
                    description: "The lab result has been updated successfully.",
                })
            } else {
                await createLabResult(formData)
                toast({
                    title: "Lab result created",
                    description: "The lab result has been created successfully.",
                })
            }

            if (medicalRecordId) {
                router.push(`/medical-records/${medicalRecordId}`)
            } else if (patientId) {
                router.push(`/patients/${patientId}/lab-results`)
            } else {
                router.push("/lab-results")
            }
        } catch (error) {
            console.error("Error submitting lab result:", error)
            toast({
                title: "Error",
                description: "Failed to save lab result. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Watch the status field to conditionally show/hide fields
    const status = form.watch("status")
    const selectedTestType = form.watch("labTestTypeId")

    // Find the selected test type to get its unit
    const selectedTest = labTestTypes.find((test) => test.id.toString() === selectedTestType)

    // Update unit when test type changes
    React.useEffect(() => {
        if (selectedTest && !labResult) {
            form.setValue("unit", selectedTest.unit || "")
        }
    }, [selectedTestType, form, selectedTest, labResult])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Patient</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!!patientId || isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select patient" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.id} value={patient.id}>
                                                {patient.first_name} {patient.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="labTestTypeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lab Test</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select lab test" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {labTestTypes.map((testType) => (
                                            <SelectItem key={testType.id} value={testType.id.toString()}>
                                                {testType.name} ({testType.category?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="orderedByDoctorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ordered By</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isSubmitting || !!labResult}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select doctor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.user_profiles?.first_name} {doctor.user_profiles?.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="testDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Test Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                disabled={isSubmitting}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ordered">Ordered</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {(status === "in_progress" || status === "completed") && (
                        <FormField
                            control={form.control}
                            name="performedByStaffId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Performed By</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {staff.map((staffMember) => (
                                                <SelectItem key={staffMember.id} value={staffMember.id}>
                                                    {staffMember.profile?.first_name} {staffMember.profile?.last_name} ({staffMember.position})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {status === "completed" && (
                        <>
                            <FormField
                                control={form.control}
                                name="resultDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Result Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        disabled={isSubmitting}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="result"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Result Value</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        {selectedTest?.normal_range && (
                                            <FormDescription>
                                                Normal range: {selectedTest.normal_range} {selectedTest.unit}
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isAbnormal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Abnormal Result</FormLabel>
                                            <FormDescription>Check if the result is outside the normal range</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter any additional notes or observations"
                                    className="min-h-[100px]"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (medicalRecordId) {
                                router.push(`/medical-records/${medicalRecordId}`)
                            } else if (patientId) {
                                router.push(`/patients/${patientId}/lab-results`)
                            } else {
                                router.push("/lab-results")
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : labResult ? "Update Lab Result" : "Create Lab Result"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
