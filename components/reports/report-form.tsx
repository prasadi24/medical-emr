"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
    type ReportType,
    type ReportTimeframe,
    type ReportFormat,
    createReportConfiguration,
    updateReportConfiguration,
} from "@/app/actions/reporting-actions"

const reportFormSchema = z.object({
    name: z.string().min(3, { message: "Report name must be at least 3 characters" }),
    description: z.string().optional(),
    report_type: z.string(),
    timeframe: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    clinicId: z.string().optional(),
    doctorId: z.string().optional(),
    patientId: z.string().optional(),
    categoryId: z.string().optional(),
    format: z.string().optional(),
    chartType: z.string().optional(),
    customQuery: z.string().optional(),
    is_public: z.boolean().default(false),
    is_favorite: z.boolean().default(false),
    schedule: z.string().optional(),
})

type ReportFormValues = z.infer<typeof reportFormSchema>

interface ReportFormProps {
    report?: any
    clinics?: any[]
    doctors?: any[]
    patients?: any[]
    categories?: any[]
}

export function ReportForm({ report, clinics = [], doctors = [], patients = [], categories = [] }: ReportFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const defaultValues: Partial<ReportFormValues> = {
        name: report?.name || "",
        description: report?.description || "",
        report_type: report?.report_type || "patient_demographics",
        timeframe: report?.parameters?.timeframe || "monthly",
        startDate: report?.parameters?.startDate ? new Date(report?.parameters?.startDate) : undefined,
        endDate: report?.parameters?.endDate ? new Date(report?.parameters?.endDate) : undefined,
        clinicId: report?.parameters?.clinicId || "",
        doctorId: report?.parameters?.doctorId || "",
        patientId: report?.parameters?.patientId || "",
        categoryId: report?.parameters?.categoryId || "",
        format: report?.parameters?.format || "combined",
        chartType: report?.parameters?.chartType || "bar",
        customQuery: report?.parameters?.customQuery || "",
        is_public: report?.is_public || false,
        is_favorite: report?.is_favorite || false,
        schedule: report?.schedule || "",
    }

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues,
    })

    const reportType = form.watch("report_type")
    const timeframe = form.watch("timeframe")

    async function onSubmit(data: ReportFormValues) {
        setIsLoading(true)

        try {
            const parameters = {
                timeframe: data.timeframe as ReportTimeframe,
                startDate: data.startDate ? data.startDate.toISOString() : undefined,
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
                clinicId: data.clinicId,
                doctorId: data.doctorId,
                patientId: data.patientId,
                categoryId: data.categoryId,
                format: data.format as ReportFormat,
                chartType: data.chartType,
                customQuery: data.customQuery,
            }

            if (report?.id) {
                await updateReportConfiguration(report.id, {
                    name: data.name,
                    description: data.description,
                    report_type: data.report_type as ReportType,
                    parameters,
                    is_public: data.is_public,
                    is_favorite: data.is_favorite,
                    schedule: data.schedule,
                })
            } else {
                await createReportConfiguration({
                    name: data.name,
                    description: data.description,
                    report_type: data.report_type as ReportType,
                    parameters,
                    is_public: data.is_public,
                    is_favorite: data.is_favorite,
                    schedule: data.schedule,
                })
            }

            router.push("/reports")
            router.refresh()
        } catch (error) {
            console.error("Error saving report:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{report ? "Edit Report" : "Create New Report"}</CardTitle>
                        <CardDescription>Configure your report settings and parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Report Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Monthly Patient Demographics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="report_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Report Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a report type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="patient_demographics">Patient Demographics</SelectItem>
                                                <SelectItem value="appointment_analytics">Appointment Analytics</SelectItem>
                                                <SelectItem value="billing_summary">Billing Summary</SelectItem>
                                                <SelectItem value="inventory_status">Inventory Status</SelectItem>
                                                <SelectItem value="staff_performance">Staff Performance</SelectItem>
                                                <SelectItem value="medical_records_summary">Medical Records Summary</SelectItem>
                                                <SelectItem value="prescription_analytics">Prescription Analytics</SelectItem>
                                                <SelectItem value="lab_results_summary">Lab Results Summary</SelectItem>
                                                <SelectItem value="custom_query">Custom Query</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Report description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {reportType !== "custom_query" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="timeframe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timeframe</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a timeframe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                    <SelectItem value="custom">Custom Date Range</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="format"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Format</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="table">Table</SelectItem>
                                                    <SelectItem value="chart">Chart</SelectItem>
                                                    <SelectItem value="combined">Combined</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {timeframe === "custom" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Report-specific fields */}
                        {(reportType === "appointment_analytics" ||
                            reportType === "staff_performance" ||
                            reportType === "medical_records_summary" ||
                            reportType === "prescription_analytics") && (
                                <FormField
                                    control={form.control}
                                    name="doctorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doctor</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a doctor (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">All Doctors</SelectItem>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>
                                                            {doctor.first_name} {doctor.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Filter report by a specific doctor</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                        {(reportType === "appointment_analytics" || reportType === "billing_summary") && (
                            <FormField
                                control={form.control}
                                name="clinicId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Clinic</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a clinic (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">All Clinics</SelectItem>
                                                {clinics.map((clinic) => (
                                                    <SelectItem key={clinic.id} value={clinic.id}>
                                                        {clinic.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Filter report by a specific clinic</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {(reportType === "medical_records_summary" || reportType === "lab_results_summary") && (
                            <FormField
                                control={form.control}
                                name="patientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a patient (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">All Patients</SelectItem>
                                                {patients.map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id}>
                                                        {patient.first_name} {patient.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Filter report by a specific patient</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {reportType === "inventory_status" && (
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inventory Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Filter report by a specific inventory category</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {reportType === "custom_query" && (
                            <FormField
                                control={form.control}
                                name="customQuery"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom SQL Query</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="SELECT * FROM patients WHERE..." className="font-mono h-32" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter a custom SQL query. For security reasons, only SELECT statements are allowed.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="is_public"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Public Report</FormLabel>
                                            <FormDescription>Make this report visible to all users</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_favorite"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Favorite</FormLabel>
                                            <FormDescription>Add this report to your favorites for quick access</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="schedule"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Schedule</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a schedule (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">No Schedule</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Automatically generate this report on a schedule</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => router.back()} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : report ? "Update Report" : "Create Report"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
