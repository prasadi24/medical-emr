import Link from "next/link"
import { notFound } from "next/navigation"
import { getMedicalRecordById } from "@/app/actions/medical-record-actions"
import { getVitals } from "@/app/actions/vitals-actions"
import { getPrescriptions } from "@/app/actions/prescription-actions"
import { getDocuments } from "@/app/actions/document-actions"
import { getLabResults } from "@/app/actions/lab-result-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicalRecordTabs } from "@/components/medical-records/medical-record-tabs"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit } from "lucide-react"

export default async function MedicalRecordDetailsPage({ params }: { params: { id: string } }) {
  try {
    const medicalRecord = await getMedicalRecordById(params.id)
    const { vitals } = await getVitals({ medicalRecordId: params.id })
    const { prescriptions } = await getPrescriptions({ medicalRecordId: params.id })
    const { documents } = await getDocuments({ medicalRecordId: params.id })
    const { labResults } = await getLabResults({ medicalRecordId: params.id })

    return (
      <RequireRole roles={["Admin", "Doctor", "Nurse", "Medical Records"]} fallback={<div>Access denied</div>}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/medical-records">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Medical Record Details</h1>
            </div>
            <Button asChild>
              <Link href={`/medical-records/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Information</CardTitle>
                <CardDescription>Details about this medical visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Visit Date</h3>
                  <p>{formatDate(medicalRecord.visit_date)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Chief Complaint</h3>
                  <p>{medicalRecord.chief_complaint}</p>
                </div>
                <div>
                  <h3 className="font-medium">Diagnosis</h3>
                  <p>{medicalRecord.diagnosis}</p>
                </div>
                <div>
                  <h3 className="font-medium">Treatment Plan</h3>
                  <p>{medicalRecord.treatment_plan}</p>
                </div>
                <div>
                  <h3 className="font-medium">Follow-up Instructions</h3>
                  <p>{medicalRecord.follow_up_instructions || "None"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>
                    <Link href={`/patients/${medicalRecord.patient_id}`} className="text-blue-600 hover:underline">
                      {medicalRecord.patient.first_name} {medicalRecord.patient.last_name}
                    </Link>
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Date of Birth</h3>
                  <p>{formatDate(medicalRecord.patient.date_of_birth)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Doctor</h3>
                  <p>
                    Dr. {medicalRecord.doctor.user.user_profiles.first_name}{" "}
                    {medicalRecord.doctor.user.user_profiles.last_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Clinic</h3>
                  <p>{medicalRecord.clinic.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <MedicalRecordTabs
            medicalRecordId={params.id}
            patientId={medicalRecord.patient_id}
            vitals={vitals}
            prescriptions={prescriptions}
            documents={documents}
            labResults={labResults}
          />
        </div>
      </RequireRole>
    )
  } catch (error) {
    console.error("Error fetching medical record:", error)
    notFound()
  }
}
