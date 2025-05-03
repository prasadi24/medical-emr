import { getAppointmentById } from "@/app/actions/appointment-actions"
import { getPatients } from "@/app/actions/patient-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getClinics } from "@/app/actions/clinic-actions"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { RequireRole } from "@/components/auth/require-role"
import { notFound } from "next/navigation"

export default async function EditAppointmentPage({ params }: { params: { id: string } }) {
    const [appointment, patients, doctors, clinics] = await Promise.all([
        getAppointmentById(params.id),
        getPatients(),
        getDoctors(),
        getClinics(),
    ])

    if (!appointment) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
                    <p className="text-muted-foreground">Update appointment details</p>
                </div>

                <AppointmentForm
                    patients={patients}
                    doctors={doctors}
                    clinics={clinics}
                    initialData={{
                        id: appointment.id,
                        patient_id: appointment.patient_id,
                        doctor_id: appointment.doctor_id,
                        clinic_id: appointment.clinic_id,
                        appointment_date: appointment.appointment_date,
                        duration: appointment.duration,
                        status: appointment.status,
                        type: appointment.type,
                        reason: appointment.reason,
                        notes: appointment.notes,
                    }}
                />
            </div>
        </RequireRole>
    )
}
