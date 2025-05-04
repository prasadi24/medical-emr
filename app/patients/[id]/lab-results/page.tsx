import Link from "next/link"
import { notFound } from "next/navigation"
import { getPatientById } from "@/app/actions/patient-actions"
import { getLabResults } from "@/app/actions/lab-result-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { LabResultsList } from "@/components/lab-results/lab-results-list"
import { ArrowLeft, Plus } from "lucide-react"

export default async function PatientLabResultsPage({
    params,
    searchParams,
}: {
    params: { id: string }
    searchParams: { page?: string; limit?: string }
}) {
    try {
        const patient = await getPatientById(params.id)
        const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
        const limit = searchParams.limit ? Number.parseInt(searchParams.limit) : 10

        const { labResults, totalCount } = await getLabResults({
            patientId: params.id,
            page,
            limit,
        })

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={`/patients/${params.id}`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Lab Results for {patient.first_name} {patient.last_name}
                            </h1>
                        </div>
                        <Button asChild>
                            <Link href={`/patients/${params.id}/lab-results/new`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Order New Lab Test
                            </Link>
                        </Button>
                    </div>

                    <LabResultsList labResults={labResults} patientId={params.id} />

                    {/* Pagination would go here */}
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching patient lab results:", error)
        notFound()
    }
}
