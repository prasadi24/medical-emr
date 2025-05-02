import { getMedicalRecordById } from "@/app/actions/medical-record-actions"
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form"
import { RequireRole } from "@/components/auth/require-role"
import { notFound } from "next/navigation"

export default async function EditMedicalRecordPage({ params }: { params: { id: string } }) {
    const record = await getMedicalRecordById(params.id)

    if (!record) {
        notFound()
    }

    return (
        <RequireRole roles={["Admin", "Doctor"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Medical Record</h1>
                    <p className="text-muted-foreground">
                        Update medical record for {record.patients?.first_name} {record.patients?.last_name}
                    </p>
                </div>

                <MedicalRecordForm
                    patientId={record.patient_id}
                    initialData={{
                        id: record.id,
                        patient_id: record.patient_id,
                        chief_complaint: record.chief_complaint,
                        diagnosis: record.diagnosis,
                        treatment_plan: record.treatment_plan,
                        notes: record.notes,
                        follow_up_date: record.follow_up_date,
                    }}
                />
            </div>
        </RequireRole>
    )
}
