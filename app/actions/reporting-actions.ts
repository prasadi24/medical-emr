"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { auditLogger } from "@/lib/audit-logger"

// Type definitions
interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    created_at: string;
}

interface Appointment {
    id: string;
    appointment_date: string;
    status: string;
    doctor: { id: string; first_name: string; last_name: string } | null;
    patient: { id: string; first_name: string; last_name: string } | null;
    clinic: { id: string; name: string } | null;
    appointment_type: string;
    created_at: string;
}

interface Invoice {
    id: string;
    invoice_number: string;
    patient_id: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    due_date: string;
    created_at: string;
    items?: InvoiceItem[];
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface InventoryItem {
    id: string;
    name: string;
    current_stock: number;
    reorder_level: number;
    category?: { id: string; name: string };
    is_medication: boolean;
    unit_price?: number;
}

interface Transaction {
    id: string;
    item_id: string;
    transaction_type: string;
    quantity: number;
    transaction_date: string;
    item?: { id: string; name: string };
}

interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    treatment_plan: string;
    created_at: string;
    updated_at: string;
    patient?: { id: string; first_name: string; last_name: string };
    doctor?: { id: string; first_name: string; last_name: string };
}

interface Prescription {
    id: string;
    patient_id: string;
    doctor_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    status: string;
    created_at: string;
    patient?: { id: string; first_name: string; last_name: string };
    doctor?: { id: string; first_name: string; last_name: string };
}

interface LabResult {
    id: string;
    patient_id: string;
    doctor_id: string;
    test_name: string;
    test_date: string;
    status: string;
    result_summary: string;
    created_at: string;
    patient?: { id: string; first_name: string; last_name: string };
    doctor?: { id: string; first_name: string; last_name: string };
}

// Report Types
export type ReportType =
    | "patient_demographics"
    | "appointment_analytics"
    | "billing_summary"
    | "inventory_status"
    | "staff_performance"
    | "medical_records_summary"
    | "prescription_analytics"
    | "lab_results_summary"
    | "custom_query"

export type ReportTimeframe = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom"

export type ReportFormat = "table" | "chart" | "combined"

export type ReportParameters = {
    timeframe?: ReportTimeframe
    startDate?: string
    endDate?: string
    clinicId?: string
    doctorId?: string
    patientId?: string
    categoryId?: string
    format?: ReportFormat
    chartType?: string
    customQuery?: string
    filters?: Record<string, any>
    groupBy?: string[]
    limit?: number
}

export type ReportConfiguration = {
    id: string
    name: string
    description?: string
    report_type: ReportType
    parameters: ReportParameters
    created_by: string
    created_at: string
    updated_at: string
    is_public: boolean
    is_favorite: boolean
    schedule?: string
}

// Get report configurations
export async function getReportConfigurations() {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to access reports")
    }

    // Get user's role
    const { data: userRole } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id).single()

    let query = supabase.from("report_configurations").select("*")

    // If not admin, only show public reports and user's own reports
    if (userRole?.role_id !== "admin") {
        query = query.or(`is_public.eq.true,created_by.eq.${user.id}`)
    }

    const { data: reports, error } = await query.order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching report configurations:", error)
        throw new Error(`Failed to fetch report configurations: ${error.message}`)
    }

    await auditLogger.view("report_configurations")

    return reports || []
}

// Get a single report configuration
export async function getReportConfiguration(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: report, error } = await supabase.from("report_configurations").select("*").eq("id", id).single()

    if (error) {
        console.error("Error fetching report configuration:", error)
        return null
    }

    await auditLogger.view("report_configurations", id)

    return report
}

// Alias for getReportConfiguration to fix the missing function error
export async function getReportById(id: string) {
    return getReportConfiguration(id);
}

// Create a new report configuration
export async function createReportConfiguration(
    data: Omit<ReportConfiguration, "id" | "created_by" | "created_at" | "updated_at">,
) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create a report")
    }

    const reportData = {
        id: uuidv4(),
        ...data,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    const { data: report, error } = await supabase.from("report_configurations").insert(reportData).select().single()

    if (error) {
        console.error("Error creating report configuration:", error)
        throw new Error(`Failed to create report configuration: ${error.message}`)
    }

    await auditLogger.create("report_configurations", report.id, { name: data.name, type: data.report_type })

    revalidatePath("/reports")
    return report
}

// Update a report configuration
export async function updateReportConfiguration(
    id: string,
    data: Partial<Omit<ReportConfiguration, "id" | "created_by" | "created_at" | "updated_at">>,
) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update a report")
    }

    // Check if user has permission to update this report
    const { data: existingReport } = await supabase
        .from("report_configurations")
        .select("created_by")
        .eq("id", id)
        .single()

    // Get user's role
    const { data: userRole } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id).single()

    // Only allow update if user is admin or the creator of the report
    if (userRole?.role_id !== "admin" && existingReport?.created_by !== user.id) {
        throw new Error("You don't have permission to update this report")
    }

    const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
    }

    const { data: report, error } = await supabase
        .from("report_configurations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating report configuration:", error)
        throw new Error(`Failed to update report configuration: ${error.message}`)
    }

    await auditLogger.update("report_configurations", id, { name: data.name, type: data.report_type })

    revalidatePath("/reports")
    revalidatePath(`/reports/${id}`)
    return report
}

// Delete a report configuration
export async function deleteReportConfiguration(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete a report")
    }

    // Check if user has permission to delete this report
    const { data: existingReport } = await supabase
        .from("report_configurations")
        .select("created_by")
        .eq("id", id)
        .single()

    // Get user's role
    const { data: userRole } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id).single()

    // Only allow delete if user is admin or the creator of the report
    if (userRole?.role_id !== "admin" && existingReport?.created_by !== user.id) {
        throw new Error("You don't have permission to delete this report")
    }

    // Delete associated report results first
    await supabase.from("report_results").delete().eq("configuration_id", id)

    // Delete the report configuration
    const { error } = await supabase.from("report_configurations").delete().eq("id", id)

    if (error) {
        console.error("Error deleting report configuration:", error)
        throw new Error(`Failed to delete report configuration: ${error.message}`)
    }

    await auditLogger.delete("report_configurations", id)

    revalidatePath("/reports")
}

// Save report result
export async function saveReportResult(configId: string, resultData: any) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to save report results")
    }

    const resultRecord = {
        id: uuidv4(),
        configuration_id: configId,
        result_data: resultData,
        generated_at: new Date().toISOString(),
        generated_by: user.id,
    }

    const { data: result, error } = await supabase.from("report_results").insert(resultRecord).select().single()

    if (error) {
        console.error("Error saving report result:", error)
        throw new Error(`Failed to save report result: ${error.message}`)
    }

    await auditLogger.create("report_results", result.id, { configuration_id: configId })

    return result
}

// Get report results for a configuration
export async function getReportResults(configId: string) {
    const supabase = createServerSupabaseClient()

    const { data: results, error } = await supabase
        .from("report_results")
        .select("*")
        .eq("configuration_id", configId)
        .order("generated_at", { ascending: false })

    if (error) {
        console.error("Error fetching report results:", error)
        throw new Error(`Failed to fetch report results: ${error.message}`)
    }

    // Fix: Pass empty string instead of undefined
    await auditLogger.view("report_results", "", { configuration_id: configId })

    return results || []
}

// Generate report data based on type and parameters
export async function generateReportData(reportType: ReportType, parameters: ReportParameters) {
    const supabase = createServerSupabaseClient()

    let result: any = null
    const error: any = null

    switch (reportType) {
        case "patient_demographics":
            result = await generatePatientDemographicsReport(supabase, parameters)
            break
        case "appointment_analytics":
            result = await generateAppointmentAnalyticsReport(supabase, parameters)
            break
        case "billing_summary":
            result = await generateBillingSummaryReport(supabase, parameters)
            break
        case "inventory_status":
            result = await generateInventoryStatusReport(supabase, parameters)
            break
        case "staff_performance":
            result = await generateStaffPerformanceReport(supabase, parameters)
            break
        case "medical_records_summary":
            result = await generateMedicalRecordsSummaryReport(supabase, parameters)
            break
        case "prescription_analytics":
            result = await generatePrescriptionAnalyticsReport(supabase, parameters)
            break
        case "lab_results_summary":
            result = await generateLabResultsSummaryReport(supabase, parameters)
            break
        case "custom_query":
            if (!parameters.customQuery) {
                throw new Error("Custom query is required for custom_query report type")
            }
            result = await executeCustomQuery(supabase, parameters.customQuery)
            break
        default:
            throw new Error(`Unsupported report type: ${reportType}`)
    }

    await auditLogger.create("report_generation", "", { type: reportType, parameters })

    return result
}

// Helper functions for generating specific report types
async function generatePatientDemographicsReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, clinicId } = parameters

    let query = supabase.from("patients").select(`
    id, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender, 
    address, 
    city, 
    state, 
    postal_code,
    created_at
  `)

    if (startDate) {
        query = query.gte("created_at", startDate)
    }

    if (endDate) {
        query = query.lte("created_at", endDate)
    }

    const { data: patients, error } = await query

    if (error) {
        throw new Error(`Error generating patient demographics report: ${error.message}`)
    }

    // Calculate age distribution
    const ageGroups = {
        "0-18": 0,
        "19-35": 0,
        "36-50": 0,
        "51-65": 0,
        "66+": 0,
    }

    const genderDistribution: Record<string, number> = {}
    const locationDistribution: Record<string, number> = {}

    patients?.forEach((patient: Patient) => {
        // Calculate age
        const birthDate = new Date(patient.date_of_birth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        // Add to age group
        if (age <= 18) ageGroups["0-18"]++
        else if (age <= 35) ageGroups["19-35"]++
        else if (age <= 50) ageGroups["36-50"]++
        else if (age <= 65) ageGroups["51-65"]++
        else ageGroups["66+"]++

        // Add to gender distribution
        const gender = patient.gender || "Unknown"
        genderDistribution[gender] = (genderDistribution[gender] || 0) + 1

        // Add to location distribution
        const location = patient.city || "Unknown"
        locationDistribution[location] = (locationDistribution[location] || 0) + 1
    })

    return {
        totalPatients: patients?.length || 0,
        ageDistribution: ageGroups,
        genderDistribution,
        locationDistribution,
        rawData: patients,
    }
}

async function generateAppointmentAnalyticsReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, doctorId, clinicId } = parameters

    let query = supabase.from("appointments").select(`
    id,
    appointment_date,
    status,
    doctor:doctor_id(id, first_name, last_name),
    patient:patient_id(id, first_name, last_name),
    clinic:clinic_id(id, name),
    appointment_type,
    created_at
  `)

    if (startDate) {
        query = query.gte("appointment_date", startDate)
    }

    if (endDate) {
        query = query.lte("appointment_date", endDate)
    }

    if (doctorId) {
        query = query.eq("doctor_id", doctorId)
    }

    if (clinicId) {
        query = query.eq("clinic_id", clinicId)
    }

    const { data: appointments, error } = await query

    if (error) {
        throw new Error(`Error generating appointment analytics report: ${error.message}`)
    }

    // Calculate statistics
    const statusDistribution: Record<string, number> = {}
    const typeDistribution: Record<string, number> = {}
    const doctorDistribution: Record<string, number> = {}
    const appointmentsByDay: Record<string, number> = {}
    const appointmentsByMonth: Record<string, number> = {}

    appointments?.forEach((appointment: Appointment) => {
        // Status distribution
        const status = appointment.status || "Unknown"
        statusDistribution[status] = (statusDistribution[status] || 0) + 1

        // Type distribution
        const type = appointment.appointment_type || "Unknown"
        typeDistribution[type] = (typeDistribution[type] || 0) + 1

        // Doctor distribution
        const doctorName = appointment.doctor
            ? `${appointment.doctor.first_name} ${appointment.doctor.last_name}`
            : "Unknown"
        doctorDistribution[doctorName] = (doctorDistribution[doctorName] || 0) + 1

        // Appointments by day
        const date = new Date(appointment.appointment_date)
        const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })
        appointmentsByDay[dayOfWeek] = (appointmentsByDay[dayOfWeek] || 0) + 1

        // Appointments by month
        const month = date.toLocaleDateString("en-US", { month: "long" })
        appointmentsByMonth[month] = (appointmentsByMonth[month] || 0) + 1
    })

    return {
        totalAppointments: appointments?.length || 0,
        statusDistribution,
        typeDistribution,
        doctorDistribution,
        appointmentsByDay,
        appointmentsByMonth,
        rawData: appointments,
    }
}

async function generateBillingSummaryReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, clinicId } = parameters

    let query = supabase.from("invoices").select(`
    id,
    invoice_number,
    patient:patient_id(id, first_name, last_name),
    total_amount,
    paid_amount,
    status,
    due_date,
    created_at,
    items:invoice_items(
      id,
      description,
      quantity,
      unit_price,
      total_price
    )
  `)

    if (startDate) {
        query = query.gte("created_at", startDate)
    }

    if (endDate) {
        query = query.lte("created_at", endDate)
    }

    const { data: invoices, error } = await query

    if (error) {
        throw new Error(`Error generating billing summary report: ${error.message}`)
    }

    // Calculate statistics
    let totalBilled = 0
    let totalPaid = 0
    let totalOutstanding = 0
    const statusDistribution: Record<string, number> = {}
    const monthlyRevenue: Record<string, number> = {}
    const topServices: Record<string, number> = {}

    invoices?.forEach((invoice: Invoice) => {
        totalBilled += invoice.total_amount || 0
        totalPaid += invoice.paid_amount || 0
        totalOutstanding += invoice.total_amount - invoice.paid_amount || 0

        // Status distribution
        const status = invoice.status || "Unknown"
        statusDistribution[status] = (statusDistribution[status] || 0) + 1

        // Monthly revenue
        const date = new Date(invoice.created_at)
        const month = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.total_amount

        // Top services
        invoice.items?.forEach((item: InvoiceItem) => {
            topServices[item.description] = (topServices[item.description] || 0) + item.total_price
        })
    })

    // Sort top services - Fix: Add explicit type annotations to sort function parameters
    const sortedTopServices = Object.entries(topServices)
        .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
        .reduce((r: Record<string, number>, [k, v]: [string, number]) => ({ ...r, [k]: v }), {})

    return {
        totalBilled,
        totalPaid,
        totalOutstanding,
        invoiceCount: invoices?.length || 0,
        statusDistribution,
        monthlyRevenue,
        topServices: sortedTopServices,
        rawData: invoices,
    }
}

async function generateInventoryStatusReport(supabase: any, parameters: ReportParameters) {
    const { categoryId } = parameters

    let query = supabase.from("inventory_items").select(`
    id,
    name,
    sku,
    category:category_id(id, name),
    current_stock,
    minimum_stock_level,
    reorder_level,
    unit_of_measure,
    is_medication,
    is_active,
    location
  `)

    if (categoryId) {
        query = query.eq("category_id", categoryId)
    }

    const { data: items, error } = await query

    if (error) {
        throw new Error(`Error generating inventory status report: ${error.message}`)
    }

    // Get transactions for trend analysis
    const { data: transactions, error: transactionError } = await supabase
        .from("inventory_transactions")
        .select(`
      id,
      item_id,
      transaction_type,
      quantity,
      transaction_date
    `)
        .order("transaction_date", { ascending: true })

    if (transactionError) {
        throw new Error(`Error fetching inventory transactions: ${transactionError.message}`)
    }

    // Calculate statistics
    const lowStockItems = items?.filter((item: InventoryItem) => item.current_stock <= item.reorder_level) || []
    const outOfStockItems = items?.filter((item: InventoryItem) => item.current_stock <= 0) || []
    const categoryDistribution: Record<string, number> = {}
    const medicationVsSupplies = {
        medications: items?.filter((item: InventoryItem) => item.is_medication).length || 0,
        supplies: items?.filter((item: InventoryItem) => !item.is_medication).length || 0,
    }

    // Transaction trends by item
    const transactionTrends: Record<string, any[]> = {}

    items?.forEach((item: InventoryItem) => {
        // Category distribution
        const categoryName = item.category?.name || "Unknown"
        categoryDistribution[categoryName] = (categoryDistribution[categoryName] || 0) + 1

        // Initialize transaction trends for this item
        transactionTrends[item.id] = []
    })

    // Process transactions for trends
    transactions?.forEach((transaction: Transaction) => {
        if (transactionTrends[transaction.item_id]) {
            transactionTrends[transaction.item_id].push({
                date: transaction.transaction_date,
                type: transaction.transaction_type,
                quantity: transaction.quantity,
            })
        }
    })

    return {
        totalItems: items?.length || 0,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        categoryDistribution,
        medicationVsSupplies,
        transactionTrends,
        rawData: {
            items,
            lowStockItems,
            outOfStockItems,
        },
    }
}

async function generateStaffPerformanceReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, clinicId } = parameters

    // Get doctors
    const { data: doctors, error: doctorsError } = await supabase.from("doctors").select(`
      id,
      first_name,
      last_name,
      specialization,
      clinic_id
    `)

    if (doctorsError) {
        throw new Error(`Error fetching doctors: ${doctorsError.message}`)
    }

    // For each doctor, get their appointments
    const doctorPerformance = []

    for (const doctor of doctors || []) {
        let appointmentQuery = supabase
            .from("appointments")
            .select("id, status, appointment_date")
            .eq("doctor_id", doctor.id)

        if (startDate) {
            appointmentQuery = appointmentQuery.gte("appointment_date", startDate)
        }

        if (endDate) {
            appointmentQuery = appointmentQuery.lte("appointment_date", endDate)
        }

        const { data: appointments, error: appointmentsError } = await appointmentQuery

        if (appointmentsError) {
            console.error(`Error fetching appointments for doctor ${doctor.id}:`, appointmentsError)
            continue
        }

        // Get medical records created by this doctor
        let recordsQuery = supabase.from("medical_records").select("id, created_at").eq("doctor_id", doctor.id)

        if (startDate) {
            recordsQuery = recordsQuery.gte("created_at", startDate)
        }

        if (endDate) {
            recordsQuery = recordsQuery.lte("created_at", endDate)
        }

        const { data: records, error: recordsError } = await recordsQuery

        if (recordsError) {
            console.error(`Error fetching medical records for doctor ${doctor.id}:`, recordsError)
            continue
        }

        // Get prescriptions written by this doctor
        let prescriptionsQuery = supabase.from("prescriptions").select("id, created_at").eq("doctor_id", doctor.id)

        if (startDate) {
            prescriptionsQuery = prescriptionsQuery.gte("created_at", startDate)
        }

        if (endDate) {
            prescriptionsQuery = prescriptionsQuery.lte("created_at", endDate)
        }

        const { data: prescriptions, error: prescriptionsError } = await prescriptionsQuery

        if (prescriptionsError) {
            console.error(`Error fetching prescriptions for doctor ${doctor.id}:`, prescriptionsError)
            continue
        }

        // Calculate performance metrics
        const totalAppointments = appointments?.length || 0
        const completedAppointments = appointments?.filter((a: { status: string }) => a.status === "completed").length || 0
        const cancelledAppointments = appointments?.filter((a: { status: string }) => a.status === "cancelled").length || 0


        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

        doctorPerformance.push({
            id: doctor.id,
            name: `${doctor.first_name} ${doctor.last_name}`,
            specialization: doctor.specialization,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            completionRate,
            recordsCreated: records?.length || 0,
            prescriptionsWritten: prescriptions?.length || 0,
        })
    }

    return {
        totalDoctors: doctors?.length || 0,
        doctorPerformance,
        rawData: {
            doctors,
        },
    }
}

async function generateMedicalRecordsSummaryReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, doctorId, patientId } = parameters

    let query = supabase.from("medical_records").select(`
    id,
    patient:patient_id(id, first_name, last_name),
    doctor:doctor_id(id, first_name, last_name),
    diagnosis,
    treatment_plan,
    created_at,
    updated_at
  `)

    if (startDate) {
        query = query.gte("created_at", startDate)
    }

    if (endDate) {
        query = query.lte("created_at", endDate)
    }

    if (doctorId) {
        query = query.eq("doctor_id", doctorId)
    }

    if (patientId) {
        query = query.eq("patient_id", patientId)
    }

    const { data: records, error } = await query

    if (error) {
        throw new Error(`Error generating medical records summary report: ${error.message}`)
    }

    // Calculate statistics
    const recordsByDoctor: Record<string, number> = {}
    const recordsByMonth: Record<string, number> = {}
    const diagnosisDistribution: Record<string, number> = {}

    records?.forEach((record: MedicalRecord) => {
        // Records by doctor
        const doctorName = record.doctor ? `${record.doctor.first_name} ${record.doctor.last_name}` : "Unknown"
        recordsByDoctor[doctorName] = (recordsByDoctor[doctorName] || 0) + 1

        // Records by month
        const date = new Date(record.created_at)
        const month = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        recordsByMonth[month] = (recordsByMonth[month] || 0) + 1

        // Diagnosis distribution
        if (record.diagnosis) {
            // Simplify by taking first diagnosis if multiple
            const mainDiagnosis = record.diagnosis.split(",")[0].trim()
            diagnosisDistribution[mainDiagnosis] = (diagnosisDistribution[mainDiagnosis] || 0) + 1
        }
    })

    return {
        totalRecords: records?.length || 0,
        recordsByDoctor,
        recordsByMonth,
        diagnosisDistribution,
        rawData: records,
    }
}

async function generatePrescriptionAnalyticsReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, doctorId } = parameters

    let query = supabase.from("prescriptions").select(`
    id,
    patient:patient_id(id, first_name, last_name),
    doctor:doctor_id(id, first_name, last_name),
    medication_name,
    dosage,
    frequency,
    duration,
    status,
    created_at
  `)

    if (startDate) {
        query = query.gte("created_at", startDate)
    }

    if (endDate) {
        query = query.lte("created_at", endDate)
    }

    if (doctorId) {
        query = query.eq("doctor_id", doctorId)
    }

    const { data: prescriptions, error } = await query

    if (error) {
        throw new Error(`Error generating prescription analytics report: ${error.message}`)
    }

    // Calculate statistics
    const medicationDistribution: Record<string, number> = {}
    const statusDistribution: Record<string, number> = {}
    const prescriptionsByDoctor: Record<string, number> = {}
    const prescriptionsByMonth: Record<string, number> = {}

    prescriptions?.forEach((prescription: Prescription) => {
        // Medication distribution
        const medication = prescription.medication_name || "Unknown"
        medicationDistribution[medication] = (medicationDistribution[medication] || 0) + 1

        // Status distribution
        const status = prescription.status || "Unknown"
        statusDistribution[status] = (statusDistribution[status] || 0) + 1

        // Prescriptions by doctor
        const doctorName = prescription.doctor
            ? `${prescription.doctor.first_name} ${prescription.doctor.last_name}`
            : "Unknown"
        prescriptionsByDoctor[doctorName] = (prescriptionsByDoctor[doctorName] || 0) + 1

        // Prescriptions by month
        const date = new Date(prescription.created_at)
        const month = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        prescriptionsByMonth[month] = (prescriptionsByMonth[month] || 0) + 1
    })

    return {
        totalPrescriptions: prescriptions?.length || 0,
        medicationDistribution,
        statusDistribution,
        prescriptionsByDoctor,
        prescriptionsByMonth,
        rawData: prescriptions,
    }
}

async function generateLabResultsSummaryReport(supabase: any, parameters: ReportParameters) {
    const { startDate, endDate, patientId } = parameters

    let query = supabase.from("lab_results").select(`
    id,
    patient:patient_id(id, first_name, last_name),
    doctor:doctor_id(id, first_name, last_name),
    test_name,
    test_date,
    status,
    result_summary,
    created_at
  `)

    if (startDate) {
        query = query.gte("test_date", startDate)
    }

    if (endDate) {
        query = query.lte("test_date", endDate)
    }

    if (patientId) {
        query = query.eq("patient_id", patientId)
    }

    const { data: labResults, error } = await query

    if (error) {
        throw new Error(`Error generating lab results summary report: ${error.message}`)
    }

    // Calculate statistics
    const testDistribution: Record<string, number> = {}
    const statusDistribution: Record<string, number> = {}
    const resultsByMonth: Record<string, number> = {}

    labResults?.forEach((result: LabResult) => {
        // Test distribution
        const test = result.test_name || "Unknown"
        testDistribution[test] = (testDistribution[test] || 0) + 1

        // Status distribution
        const status = result.status || "Unknown"
        statusDistribution[status] = (statusDistribution[status] || 0) + 1

        // Results by month
        const date = new Date(result.test_date)
        const month = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        resultsByMonth[month] = (resultsByMonth[month] || 0) + 1
    })

    return {
        totalLabResults: labResults?.length || 0,
        testDistribution,
        statusDistribution,
        resultsByMonth,
        rawData: labResults,
    }
}

async function executeCustomQuery(supabase: any, customQuery: string) {
    // Security check - only allow SELECT queries
    const normalizedQuery = customQuery.trim().toLowerCase()
    if (!normalizedQuery.startsWith("select ")) {
        throw new Error("Only SELECT queries are allowed for security reasons")
    }

    // Execute the custom query
    const { data, error } = await supabase.rpc("execute_custom_query", { query: customQuery })

    if (error) {
        throw new Error(`Error executing custom query: ${error.message}`)
    }

    return {
        results: data,
        query: customQuery,
    }
}