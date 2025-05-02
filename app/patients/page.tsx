import { getPatients } from "@/app/actions/patient-actions"
import { PatientsList } from "@/components/patients/patients-list"
import { RequireRole } from "@/components/auth/require-role"

export default async function PatientsPage() {
    const patients = await getPatients()

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                    <p className="text-muted-foreground">Manage patient information</p>
                </div>

                <PatientsList patients={patients} />
            </div>
        </RequireRole>
    )
}
