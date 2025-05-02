import { PatientForm } from "@/components/patients/patient-form"
import { RequireRole } from "@/components/auth/require-role"

export default function NewPatientPage() {
    return (
        <RequireRole roles={["Admin", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
                    <p className="text-muted-foreground">Create a new patient record</p>
                </div>

                <PatientForm />
            </div>
        </RequireRole>
    )
}
