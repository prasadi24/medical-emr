import { getClinicById } from "@/app/actions/clinic-actions"
import { ClinicForm } from "@/components/clinics/clinic-form"
import { RequireRole } from "@/components/auth/require-role"
import { notFound } from "next/navigation"

export default async function EditClinicPage({ params }: { params: { id: string } }) {
    const clinic = await getClinicById(params.id)

    if (!clinic) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Clinic</h1>
                    <p className="text-muted-foreground">Update clinic information</p>
                </div>

                <ClinicForm initialData={clinic} />
            </div>
        </RequireRole>
    )
}
