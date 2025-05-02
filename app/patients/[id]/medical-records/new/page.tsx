import { getPatientById } from "@/app/actions/patient-actions"
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form"
import { RequireRole } from "@/components/auth/require-role"
import { notFound } from "next/navigation"

export default async function NewMedicalRecordPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id)

    if (!patient) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin", "Doctor"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Medical Record</h1>
                    <p className="text-muted-foreground">
                        Create a new medical record for {patient.first_name} {patient.last_name}
                    </p>
                </div>

                <MedicalRecordForm patientId={patient.id} />
            </div>
        </RequireRole>
    )
}
