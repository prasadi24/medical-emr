import { notFound } from "next/navigation"
import Link from "next/link"
import { getPrescriptionById } from "@/app/actions/prescription-actions"
import { PrescriptionForm } from "@/components/prescriptions/prescription-form"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function EditPrescriptionPage({ params }: { params: { id: string } }) {
    try {
        const prescription = await getPrescriptionById(params.id)
        const patient = prescription.medical_records.patients

        return (
            <RequireRole roles={["Admin", "Doctor"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/prescriptions/${params.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Prescription</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prescription Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PrescriptionForm
                                        prescription={prescription}
                                        medicalRecordId={prescription.medical_record_id}
                                        doctorId={prescription.prescribed_by}
                                        isEdit={true}
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
                                            {patient.first_name} {patient.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Date of Birth</h3>
                                        <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Medical Record</h3>
                                        <p>
                                            <strong>Chief Complaint:</strong> {prescription.medical_records.chief_complaint}
                                        </p>
                                        <p>
                                            <strong>Diagnosis:</strong> {prescription.medical_records.diagnosis}
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
        console.error("Error fetching prescription:", error)
        notFound()
    }
}
