import { ClinicForm } from "@/components/clinics/clinic-form"
import { RequireRole } from "@/components/auth/require-role"

export default function NewClinicPage() {
    return (
        <RequireRole roles={["Admin"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Clinic</h1>
                    <p className="text-muted-foreground">Create a new clinic location</p>
                </div>

                <ClinicForm />
            </div>
        </RequireRole>
    )
}
