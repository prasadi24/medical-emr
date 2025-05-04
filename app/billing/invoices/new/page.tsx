import { getPatients } from "@/app/actions/patient-actions"
import { getMedicalRecords } from "@/app/actions/medical-record-actions"
import { getAppointments } from "@/app/actions/appointment-actions"
import { getBillingItems } from "@/app/actions/billing-actions"
import { RequireRole } from "@/components/auth/require-role"
import { InvoiceForm } from "@/components/billing/invoice-form"

// Define the return types for our actions
type MedicalRecordsResult = {
    medicalRecords?: any[]
}

type AppointmentsResult = {
    appointments?: any[]
}

export default async function NewInvoicePage({
    searchParams,
}: {
    searchParams: { patientId?: string; medicalRecordId?: string; appointmentId?: string }
}) {
    const patientId = searchParams.patientId
    const medicalRecordId = searchParams.medicalRecordId
    const appointmentId = searchParams.appointmentId

    // Get data for the form
    const patients = await getPatients()
    const { billingItems } = await getBillingItems({ isActive: true })

    // Only fetch related data if we have a patient ID
    let medicalRecords: any[] = []
    let appointments: any[] = []

    if (patientId) {
        const medicalRecordsResult = (await getMedicalRecords({ patientId })) as MedicalRecordsResult
        medicalRecords = medicalRecordsResult?.medicalRecords || []

        const appointmentsResult = (await getAppointments({ patientId })) as AppointmentsResult
        appointments = appointmentsResult?.appointments || []
    }

    return (
        <RequireRole roles={["Admin", "Billing Staff"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
                <InvoiceForm
                    patients={patients}
                    medicalRecords={medicalRecords}
                    appointments={appointments}
                    billingItems={billingItems}
                    patientId={patientId}
                    medicalRecordId={medicalRecordId}
                    appointmentId={appointmentId}
                />
            </div>
        </RequireRole>
    )
}
