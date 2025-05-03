import { getPatients } from "@/app/actions/patient-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getClinics } from "@/app/actions/clinic-actions"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { RequireRole } from "@/components/auth/require-role"

export default async function NewAppointmentPage({
    searchParams,
}: {
    searchParams: { patientId?: string }
}) {
    const [patients, doctors, clinics] = await Promise.all([getPatients(), getDoctors(), getClinics()])

    const defaultPatientId = searchParams.patientId

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Schedule New Appointment</h1>
                    <p className="text-muted-foreground">Create a new appointment for a patient</p>
                </div>

                <AppointmentForm patients={patients} doctors={doctors} clinics={clinics} defaultPatientId={defaultPatientId} />
            </div>
        </RequireRole>
    )
}
