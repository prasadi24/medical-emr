import { notFound } from "next/navigation"
import { getMedicalRecordById } from "@/app/actions/medical-record-actions"
import { getPatientById } from "@/app/actions/patient-actions"
import { getLabTestTypes } from "@/app/actions/lab-test-actions"
import { getDoctors } from "@/app/actions/doctor-actions"
import { getStaff } from "@/app/actions/staff-actions"
import { RequireRole } from "@/components/auth/require-role"
import { LabResultForm } from "@/components/lab-results/lab-result-form"

export default async function NewMedicalRecordLabResultPage({ params }: { params: { id: string } }) {
    try {
        const medicalRecord = await getMedicalRecordById(params.id)
        const patient = await getPatientById(medicalRecord.patient_id)
        const labTestTypes = await getLabTestTypes()
        const doctors = await getDoctors({ page: 1, limit: 100, search: "" })
        const staff = await getStaff()

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Order Lab Test for Visit on {new Date(medicalRecord.visit_date).toLocaleDateString()}
                    </h1>
                    <LabResultForm
                        patients={[patient]}
                        labTestTypes={labTestTypes}
                        doctors={doctors}
                        staff={staff}
                        patientId={patient.id}
                        medicalRecordId={params.id}
                    />
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching medical record:", error)
        notFound()
    }
}
