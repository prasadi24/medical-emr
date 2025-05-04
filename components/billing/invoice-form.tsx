"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { CalendarIcon, Trash2, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { createInvoice } from "@/app/actions/billing-actions"

const invoiceSchema = z.object({
    patientId: z.string().min(1, "Patient is required"),
    medicalRecordId: z.string().optional(),
    appointmentId: z.string().optional(),
    issuedDate: z.date({
        required_error: "Issue date is required",
    }),
    dueDate: z.date({
        required_error: "Due date is required",
    }),
    notes: z.string().optional(),
    items: z
        .array(
            z.object({
                billingItemId: z.string().optional(),
                description: z.string().min(1, "Description is required"),
                quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
                unitPrice: z.coerce.number().min(0, "Unit price must be a positive number"),
                discountPercentage: z.coerce.number().min(0).max(100).default(0),
                taxPercentage: z.coerce.number().min(0).max(100).default(0),
            }),
        )
        .min(1, "At least one item is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
    patients: any[]
    medicalRecords?: any[]
    appointments?: any[]
    billingItems: any[]
    patientId?: string
    medicalRecordId?: string
    appointmentId?: string
}

export function InvoiceForm({
    patients,
    medicalRecords = [],
    appointments = [],
    billingItems,
    patientId,
    medicalRecordId,
    appointmentId,
}: InvoiceFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState(patientId || "")
    const [filteredMedicalRecords, setFilteredMedicalRecords] = useState(medicalRecords)
    const [filteredAppointments, setFilteredAppointments] = useState(appointments)
    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
    })

    const defaultValues: Partial<InvoiceFormValues> = {
        patientId: patientId || "",
        medicalRecordId: medicalRecordId || "",
        appointmentId: appointmentId || "",
        issuedDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        notes: "",
        items: [
            {
                billingItemId: "",
                description: "",
                quantity: 1,
                unitPrice: 0,
                discountPercentage: 0,
                taxPercentage: 0,
            },
        ],
    }

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Filter medical records and appointments when patient changes
    useEffect(() => {
        if (selectedPatientId) {
            setFilteredMedicalRecords(medicalRecords.filter((record) => record.patient_id === selectedPatientId))
            setFilteredAppointments(appointments.filter((appointment) => appointment.patient_id === selectedPatientId))
        } else {
            setFilteredMedicalRecords([])
            setFilteredAppointments([])
        }
    }, [selectedPatientId, medicalRecords, appointments])

    // Update patient ID when form value changes
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "patientId" && value.patientId) {
                setSelectedPatientId(value.patientId as string)
            }
        })
        return () => subscription.unsubscribe()
    }, [form.watch])

    // Calculate totals when items change
    useEffect(() => {
        const items = form.watch("items")
        let subtotal = 0
        let tax = 0
        let discount = 0

        items.forEach((item) => {
            const lineTotal = item.quantity * item.unitPrice
            subtotal += lineTotal
            tax += lineTotal * (item.taxPercentage / 100)
            discount += lineTotal * (item.discountPercentage / 100)
        })

        const total = subtotal + tax - discount

        setTotals({
            subtotal,
            tax,
            discount,
            total,
        })
    }, [form.watch])

    // Handle billing item selection
    const handleBillingItemChange = (value: string, index: number) => {
        if (!value) return

        const selectedItem = billingItems.find((item) => item.id === value)
        if (selectedItem) {
            form.setValue(`items.${index}.description`, selectedItem.name)
            form.setValue(`items.${index}.unitPrice`, selectedItem.default_price)
        }
    }

    const onSubmit = async (data: InvoiceFormValues) => {
        setIsSubmitting(true)
        try {
            // Calculate tax and discount amounts for each item
            const processedItems = data.items.map((item) => {
                const lineTotal = item.quantity * item.unitPrice
                return {
                    ...item,
                    taxAmount: lineTotal * (item.taxPercentage / 100),
                    discountAmount: lineTotal * (item.discountPercentage / 100),
                }
            })

            const formData = new FormData()
            formData.append("patientId", data.patientId)
            if (data.medicalRecordId) {
                formData.append("medicalRecordId", data.medicalRecordId)
            }
            if (data.appointmentId) {
                formData.append("appointmentId", data.appointmentId)
            }
            formData.append("issuedDate", data.issuedDate.toISOString().slice(0, 10))
            formData.append("dueDate", data.dueDate.toISOString().slice(0, 10))
            if (data.notes) {
                formData.append("notes", data.notes)
            }
            formData.append("invoiceItems", JSON.stringify(processedItems))

            const result = await createInvoice(formData)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Invoice created successfully",
                })
                // Check if result.data exists and has an id property before redirecting
                if (result.data && result.data.id) {
                    router.push(`/billing/invoices/${result.data.id}`)
                } else {
                    router.push(`/billing/invoices`)
                }
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="patientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                // Reset related fields when patient changes
                                                form.setValue("medicalRecordId", "")
                                                form.setValue("appointmentId", "")
                                            }}
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

                            {filteredMedicalRecords.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="medicalRecordId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Medical Record</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={!!medicalRecordId || isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select medical record" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    {filteredMedicalRecords.map((record) => (
                                                        <SelectItem key={record.id} value={record.id}>
                                                            Visit: {new Date(record.visit_date).toLocaleDateString()} - {record.chief_complaint}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {filteredAppointments.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="appointmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Appointment</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={!!appointmentId || isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select appointment" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    {filteredAppointments.map((appointment) => (
                                                        <SelectItem key={appointment.id} value={appointment.id}>
                                                            {new Date(appointment.appointment_date).toLocaleString()} - {appointment.appointment_type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="issuedDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Issue Date</FormLabel>
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
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
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
                                                    disabled={(date) => date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[100px]">Qty</TableHead>
                                    <TableHead className="w-[120px]">Unit Price</TableHead>
                                    <TableHead className="w-[100px]">Discount %</TableHead>
                                    <TableHead className="w-[100px]">Tax %</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const quantity = form.watch(`items.${index}.quantity`) || 0
                                    const unitPrice = form.watch(`items.${index}.unitPrice`) || 0
                                    const discountPercentage = form.watch(`items.${index}.discountPercentage`) || 0
                                    const taxPercentage = form.watch(`items.${index}.taxPercentage`) || 0

                                    const lineTotal = quantity * unitPrice
                                    const discount = lineTotal * (discountPercentage / 100)
                                    const tax = lineTotal * (taxPercentage / 100)
                                    const total = lineTotal + tax - discount

                                    return (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.billingItemId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    field.onChange(value)
                                                                    handleBillingItemChange(value, index)
                                                                }}
                                                                value={field.value || "custom"}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select item" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="custom">Custom Item</SelectItem>
                                                                    {billingItems
                                                                        .filter((item) => item.is_active)
                                                                        .map((item) => (
                                                                            <SelectItem key={item.id} value={item.id}>
                                                                                {item.code} - {item.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Description" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unitPrice`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.discountPercentage`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.1"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.taxPercentage`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.1"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">${total.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() =>
                                append({
                                    billingItemId: "",
                                    description: "",
                                    quantity: 1,
                                    unitPrice: 0,
                                    discountPercentage: 0,
                                    taxPercentage: 0,
                                })
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col items-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span>-${totals.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter any additional notes for this invoice"
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormDescription>These notes will be visible on the invoice</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/billing/invoices")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Invoice"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}