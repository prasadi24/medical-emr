import Link from "next/link"
import { getPatientById } from "@/app/actions/patient-actions"
import { getAppointments } from "@/app/actions/appointment-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { AppointmentsList } from "@/components/appointments/appointments-list"
import { Plus } from "lucide-react"
import { notFound } from "next/navigation"

export default async function PatientAppointmentsPage({ params }: { params: { id: string } }) {
    const [patient, appointments] = await Promise.all([
        getPatientById(params.id),
        getAppointments({ patientId: params.id }),
    ])

    if (!patient) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {patient.first_name} {patient.last_name} - Appointments
                        </h1>
                        <p className="text-muted-foreground">Manage patient appointments</p>
                    </div>
                    <Button asChild>
                        <Link href={`/appointments/new?patientId=${patient.id}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Link>
                    </Button>
                </div>

                <AppointmentsList appointments={appointments} showPatientName={false} patientId={patient.id} />

                <div className="flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href={`/patients/${patient.id}`}>Back to Patient Details</Link>
                    </Button>
                </div>
            </div>
        </RequireRole>
    )
}
