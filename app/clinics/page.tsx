import Link from "next/link"
import { getClinics } from "@/app/actions/clinic-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { ClinicsList } from "@/components/clinics/clinics-list"
import { Plus } from "lucide-react"

export default async function ClinicsPage() {
    const clinics = await getClinics()

    return (
        <RequireRole roles={["Admin"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clinics</h1>
                        <p className="text-muted-foreground">Manage clinic locations and information</p>
                    </div>
                    <Button asChild>
                        <Link href="/clinics/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Clinic
                        </Link>
                    </Button>
                </div>

                <ClinicsList clinics={clinics} />
            </div>
        </RequireRole>
    )
}
