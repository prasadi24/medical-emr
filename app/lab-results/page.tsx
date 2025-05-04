import Link from "next/link"
import { getLabResults } from "@/app/actions/lab-result-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { LabResultsList } from "@/components/lab-results/lab-results-list"
import { Plus } from "lucide-react"

export default async function LabResultsPage({
    searchParams,
}: {
    searchParams: { page?: string; limit?: string }
}) {
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const limit = searchParams.limit ? Number.parseInt(searchParams.limit) : 10

    const { labResults, totalCount } = await getLabResults({ page, limit })

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
                    <Button asChild>
                        <Link href="/lab-results/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Order New Lab Test
                        </Link>
                    </Button>
                </div>

                <LabResultsList labResults={labResults} showPatientName={true} />

                {/* Pagination would go here */}
            </div>
        </RequireRole>
    )
}
