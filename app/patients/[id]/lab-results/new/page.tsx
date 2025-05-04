import { notFound } from "next/navigation"
import { getPatientById } from "@/app/actions/patient-actions"
import { getLabTestTypes } from "@/app/actions/lab-test-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getStaff } from "@/app/actions/staff-actions"
import { RequireRole } from "@/components/auth/require-role"
import { LabResultForm } from "@/components/lab-results/lab-result-form"

export default async function NewPatientLabResultPage({ params }: { params: { id: string } }) {
    try {
        const patient = await getPatientById(params.id)
        const labTestTypes = await getLabTestTypes()
        const doctors = await getDoctors({ page: 1, limit: 100, search: "" })
        const staff = await getStaff()

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Order Lab Test for {patient.first_name} {patient.last_name}
                    </h1>
                    <LabResultForm
                        patients={[patient]}
                        labTestTypes={labTestTypes}
                        doctors={doctors}
                        staff={staff}
                        patientId={params.id}
                    />
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching patient:", error)
        notFound()
    }
}
