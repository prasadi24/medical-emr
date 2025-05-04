"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, CreditCard, FileText, Printer, Send } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { updateInvoiceStatus, createPayment, createInsuranceClaim } from "@/app/actions/billing-actions"

interface InvoiceDetailProps {
    invoice: any
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)

    // Calculate payment totals
    const totalPaid = invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0
    const remainingBalance = invoice.total_amount - totalPaid

    // Payment form schema
    const paymentSchema = z.object({
        paymentDate: z.date({
            required_error: "Payment date is required",
        }),
        amount: z.coerce
            .number()
            .min(0.01, "Amount must be greater than 0")
            .max(remainingBalance, `Amount cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}`),
        paymentMethod: z.string().min(1, "Payment method is required"),
        referenceNumber: z.string().optional(),
        notes: z.string().optional(),
    })

    // Insurance claim form schema
    const claimSchema = z.object({
        insuranceProvider: z.string().min(1, "Insurance provider is required"),
        policyNumber: z.string().min(1, "Policy number is required"),
        claimNumber: z.string().optional(),
        claimDate: z.date({
            required_error: "Claim date is required",
        }),
        claimAmount: z.coerce
            .number()
            .min(0.01, "Amount must be greater than 0")
            .max(invoice.total_amount, `Amount cannot exceed the invoice total of $${invoice.total_amount.toFixed(2)}`),
        notes: z.string().optional(),
    })

    // Initialize payment form
    const paymentForm = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentDate: new Date(),
            amount: remainingBalance,
            paymentMethod: "cash",
            referenceNumber: "",
            notes: "",
        },
    })

    // Initialize claim form
    const claimForm = useForm<z.infer<typeof claimSchema>>({
        resolver: zodResolver(claimSchema),
        defaultValues: {
            insuranceProvider: invoice.patient?.insurance_provider || "",
            policyNumber: invoice.patient?.insurance_policy_number || "",
            claimNumber: "",
            claimDate: new Date(),
            claimAmount: invoice.total_amount,
            notes: "",
        },
    })

    const handleStatusChange = async (newStatus: string) => {
        if (confirm(`Are you sure you want to change the invoice status to ${newStatus}?`)) {
            setIsUpdatingStatus(true)
            try {
                const result = await updateInvoiceStatus(invoice.id, newStatus)
                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Invoice status updated successfully",
                    })
                    router.refresh()
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error("Error updating invoice status:", error)
                toast({
                    title: "Error",
                    description: "An unexpected error occurred",
                    variant: "destructive",
                })
            } finally {
                setIsUpdatingStatus(false)
            }
        }
    }

    const onPaymentSubmit = async (data: z.infer<typeof paymentSchema>) => {
        try {
            const formData = new FormData()
            formData.append("invoiceId", invoice.id)
            formData.append("paymentDate", data.paymentDate.toISOString().slice(0, 10))
            formData.append("amount", data.amount.toString())
            formData.append("paymentMethod", data.paymentMethod)
            if (data.referenceNumber) {
                formData.append("referenceNumber", data.referenceNumber)
            }
            if (data.notes) {
                formData.append("notes", data.notes)
            }

            const result = await createPayment(formData)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Payment recorded successfully",
                })
                setIsPaymentDialogOpen(false)
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error recording payment:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        }
    }

    const onClaimSubmit = async (data: z.infer<typeof claimSchema>) => {
        try {
            const formData = new FormData()
            formData.append("invoiceId", invoice.id)
            formData.append("insuranceProvider", data.insuranceProvider)
            formData.append("policyNumber", data.policyNumber)
            if (data.claimNumber) {
                formData.append("claimNumber", data.claimNumber)
            }
            formData.append("claimDate", data.claimDate.toISOString().slice(0, 10))
            formData.append("claimAmount", data.claimAmount.toString())
            if (data.notes) {
                formData.append("notes", data.notes)
            }

            const result = await createInsuranceClaim(formData)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Insurance claim submitted successfully",
                })
                setIsClaimDialogOpen(false)
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error submitting insurance claim:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Draft
                    </Badge>
                )
            case "issued":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Issued
                    </Badge>
                )
            case "paid":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Paid
                    </Badge>
                )
            case "partially_paid":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Partially Paid
                    </Badge>
                )
            case "overdue":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Overdue
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Cancelled
                    </Badge>
                )
            case "refunded":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Refunded
                    </Badge>
                )
            case "insurance_pending":
                return (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        Insurance Pending
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h2>
                    <p className="text-muted-foreground">Status: {getStatusBadge(invoice.status)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/billing/invoices/${invoice.id}/print`}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Link>
                    </Button>

                    {invoice.status === "draft" && (
                        <Button onClick={() => handleStatusChange("issued")} disabled={isUpdatingStatus}>
                            <Send className="mr-2 h-4 w-4" />
                            Issue Invoice
                        </Button>
                    )}

                    {(invoice.status === "issued" || invoice.status === "partially_paid" || invoice.status === "overdue") && (
                        <>
                            <Button variant="default" onClick={() => setIsPaymentDialogOpen(true)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>

                            {!invoice.insurance_claims?.length && (
                                <Button variant="outline" onClick={() => setIsClaimDialogOpen(true)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Submit Insurance Claim
                                </Button>
                            )}

                            {invoice.status === "issued" && (
                                <Button variant="outline" onClick={() => handleStatusChange("overdue")} disabled={isUpdatingStatus}>
                                    Mark as Overdue
                                </Button>
                            )}
                        </>
                    )}

                    {(invoice.status === "draft" || invoice.status === "issued") && (
                        <Button variant="destructive" onClick={() => handleStatusChange("cancelled")} disabled={isUpdatingStatus}>
                            Cancel Invoice
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                                <p>{formatDate(invoice.issued_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                                <p>{formatDate(invoice.due_date)}</p>
                            </div>
                            {invoice.medical_record && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Medical Record</p>
                                    <p>
                                        <Link href={`/medical-records/${invoice.medical_record.id}`} className="hover:underline">
                                            Visit on {formatDate(invoice.medical_record.visit_date)} -{" "}
                                            {invoice.medical_record.chief_complaint}
                                        </Link>
                                    </p>
                                </div>
                            )}
                            {invoice.appointment && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Appointment</p>
                                    <p>
                                        <Link href={`/appointments/${invoice.appointment.id}`} className="hover:underline">
                                            {formatDate(invoice.appointment.appointment_date)} - {invoice.appointment.appointment_type}
                                        </Link>
                                    </p>
                                </div>
                            )}
                            {invoice.notes && (
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p>{invoice.notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Patient</p>
                            <p>
                                <Link href={`/patients/${invoice.patient.id}`} className="hover:underline">
                                    {invoice.patient.first_name} {invoice.patient.last_name}
                                </Link>
                            </p>
                        </div>
                        {invoice.patient.email && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{invoice.patient.email}</p>
                            </div>
                        )}
                        {invoice.patient.phone && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p>{invoice.patient.phone}</p>
                            </div>
                        )}
                        {invoice.patient.insurance_provider && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Insurance</p>
                                <p>{invoice.patient.insurance_provider}</p>
                                {invoice.patient.insurance_policy_number && (
                                    <p className="text-sm">Policy #: {invoice.patient.insurance_policy_number}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Tax</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.invoice_items?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.description}</div>
                                        {item.billing_item && (
                                            <div className="text-sm text-muted-foreground">
                                                {item.billing_item.code} - {item.billing_item.category}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        {item.discount_amount > 0 ? (
                                            <>
                                                ${item.discount_amount.toFixed(2)}
                                                <div className="text-sm text-muted-foreground">({item.discount_percentage}%)</div>
                                            </>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.tax_amount > 0 ? (
                                            <>
                                                ${item.tax_amount.toFixed(2)}
                                                <div className="text-sm text-muted-foreground">({item.tax_percentage}%)</div>
                                            </>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${item.total_amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${invoice.tax_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span>-${invoice.discount_amount.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${invoice.total_amount.toFixed(2)}</span>
                            </div>
                            {totalPaid > 0 && (
                                <>
                                    <div className="flex justify-between text-green-600">
                                        <span>Paid:</span>
                                        <span>${totalPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Balance Due:</span>
                                        <span>${remainingBalance.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {invoice.payments && invoice.payments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.payments.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                        <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                                        <TableCell>{payment.reference_number || "-"}</TableCell>
                                        <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {invoice.insurance_claims && invoice.insurance_claims.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Insurance Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Claim #</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Approved</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.insurance_claims.map((claim: any) => (
                                    <TableRow key={claim.id}>
                                        <TableCell>{formatDate(claim.claim_date)}</TableCell>
                                        <TableCell>{claim.insurance_provider}</TableCell>
                                        <TableCell>{claim.claim_number || "-"}</TableCell>
                                        <TableCell className="capitalize">{claim.status.replace("_", " ")}</TableCell>
                                        <TableCell className="text-right">${claim.claim_amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            {claim.approved_amount ? `$${claim.approved_amount.toFixed(2)}` : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>Record a payment for invoice #{invoice.invoice_number}</DialogDescription>
                    </DialogHeader>
                    <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                            <FormField
                                control={paymentForm.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Payment Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                control={paymentForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription>Remaining balance: ${remainingBalance.toFixed(2)}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={paymentForm.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="debit_card">Debit Card</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="insurance">Insurance</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={paymentForm.control}
                                name="referenceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Optional" />
                                        </FormControl>
                                        <FormDescription>Transaction ID, check number, etc.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={paymentForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Optional" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Record Payment</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Insurance Claim Dialog */}
            <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Submit Insurance Claim</DialogTitle>
                        <DialogDescription>Submit an insurance claim for invoice #{invoice.invoice_number}</DialogDescription>
                    </DialogHeader>
                    <Form {...claimForm}>
                        <form onSubmit={claimForm.handleSubmit(onClaimSubmit)} className="space-y-4">
                            <FormField
                                control={claimForm.control}
                                name="insuranceProvider"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Insurance Provider</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Provider name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimForm.control}
                                name="policyNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Policy Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Policy number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimForm.control}
                                name="claimNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Claim Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Optional" />
                                        </FormControl>
                                        <FormDescription>If you already have a claim number</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimForm.control}
                                name="claimDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Claim Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                control={claimForm.control}
                                name="claimAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Claim Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription>Invoice total: ${invoice.total_amount.toFixed(2)}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={claimForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Optional" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Submit Claim</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
