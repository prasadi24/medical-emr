import { getPrescriptions } from "@/app/actions/prescription-actions"
import { PrescriptionsList } from "@/components/prescriptions/prescriptions-list"
import { RequireRole } from "@/components/auth/require-role"

export default async function PrescriptionsPage() {
    const { prescriptions } = await getPrescriptions({})

    return (
        <RequireRole roles={["Admin", "Doctor", "Pharmacist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
                    <p className="text-muted-foreground">View and manage all prescriptions</p>
                </div>

                <PrescriptionsList prescriptions={prescriptions} showPatientName={true} />
            </div>
        </RequireRole>
    )
}
