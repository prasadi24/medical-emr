import { notFound } from "next/navigation"
import { getLabResultById } from "@/app/actions/lab-result-actions"
import { getPatients } from "@/app/actions/patient-actions"
import { getLabTestTypes } from "@/app/actions/lab-test-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getStaff } from "@/app/actions/staff-actions"
import { RequireRole } from "@/components/auth/require-role"
import { LabResultForm } from "@/components/lab-results/lab-result-form"

export default async function EditLabResultPage({ params }: { params: { id: string } }) {
    try {
        const labResult = await getLabResultById(params.id)
        const patients = await getPatients()
        const labTestTypes = await getLabTestTypes()
        const doctors = await getDoctors({ page: 1, limit: 100, search: "" })
        const staff = await getStaff()

        if (!labResult) {
            notFound()
        }

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">Update Lab Result</h1>
                    <LabResultForm
                        labResult={labResult}
                        patients={patients}
                        labTestTypes={labTestTypes}
                        doctors={doctors}
                        staff={staff}
                    />
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching lab result:", error)
        notFound()
    }
}
