import { notFound } from "next/navigation"
import Link from "next/link"
import { getMedicalRecordById } from "@/app/actions/medical-record-actions"
import { getDocumentTypes } from "@/app/actions/document-actions"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function UploadDocumentPage({ params }: { params: { id: string } }) {
    try {
        const medicalRecord = await getMedicalRecordById(params.id)
        const documentTypes = await getDocumentTypes()

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Medical Records"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/medical-records/${params.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Document Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentUploadForm
                                        documentTypes={documentTypes}
                                        patientId={medicalRecord.patient_id}
                                        medicalRecordId={params.id}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <h3 className="font-medium">Name</h3>
                                        <p>
                                            {medicalRecord.patient.first_name} {medicalRecord.patient.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Date of Birth</h3>
                                        <p>{new Date(medicalRecord.patient.date_of_birth).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Medical Record</h3>
                                        <p>
                                            <strong>Chief Complaint:</strong> {medicalRecord.chief_complaint}
                                        </p>
                                        <p>
                                            <strong>Diagnosis:</strong> {medicalRecord.diagnosis}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching medical record:", error)
        notFound()
    }
}
