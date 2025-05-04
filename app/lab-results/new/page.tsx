import { getPatients } from "@/app/actions/patient-actions"
import { getLabTestTypes } from "@/app/actions/lab-test-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getStaff } from "@/app/actions/staff-actions"
import { RequireRole } from "@/components/auth/require-role"
import { LabResultForm } from "@/components/lab-results/lab-result-form"

export default async function NewLabResultPage() {
    const patients = await getPatients()
    const labTestTypes = await getLabTestTypes()
    const doctors = await getDoctors({ page: 1, limit: 100, search: "" })
    const staff = await getStaff()

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Order New Lab Test</h1>
                <LabResultForm patients={patients} labTestTypes={labTestTypes} doctors={doctors} staff={staff} />
            </div>
        </RequireRole>
    )
}
