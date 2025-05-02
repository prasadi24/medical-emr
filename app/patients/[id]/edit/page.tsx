import { getPatientById } from "@/app/actions/patient-actions"
import { PatientForm } from "@/components/patients/patient-form"
import { RequireRole } from "@/components/auth/require-role"
import { notFound } from "next/navigation"

export default async function EditPatientPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id)

    if (!patient) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
                    <p className="text-muted-foreground">Update patient information</p>
                </div>

                <PatientForm initialData={patient} />
            </div>
        </RequireRole>
    )
}
