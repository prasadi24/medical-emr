import Link from "next/link"
import { notFound } from "next/navigation"
import { getPrescriptionById } from "@/app/actions/prescription-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, FileEdit, RefreshCw } from "lucide-react"

export default async function PrescriptionDetailsPage({ params }: { params: { id: string } }) {
    try {
        const prescription = await getPrescriptionById(params.id)
        const patient = prescription.medical_records.patients
        const doctor = prescription.doctors.user_profiles

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Pharmacist"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/prescriptions">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Prescription Details</h1>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" asChild>
                                <Link href={`/prescriptions/${params.id}/edit`}>
                                    <FileEdit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/prescriptions/${params.id}/refill`}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refill
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Prescription Information</CardTitle>
                                <CardDescription>Details about this prescription</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Medication</h3>
                                    <p className="text-lg">{prescription.medication_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium">Dosage</h3>
                                        <p>{prescription.dosage}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Frequency</h3>
                                        <p>{prescription.frequency}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium">Duration</h3>
                                    <p>{prescription.duration}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Instructions</h3>
                                    <p>{prescription.instructions || "No special instructions"}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Status</h3>
                                    <Badge
                                        className={
                                            prescription.status === "active"
                                                ? "bg-green-500"
                                                : prescription.status === "completed"
                                                    ? "bg-blue-500"
                                                    : prescription.status === "discontinued"
                                                        ? "bg-red-500"
                                                        : "bg-yellow-500"
                                        }
                                    >
                                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="font-medium">Prescribed Date</h3>
                                    <p>{formatDate(prescription.prescribed_at)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <h3 className="font-medium">Name</h3>
                                        <p>
                                            <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">
                                                {patient.first_name} {patient.last_name}
                                            </Link>
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Date of Birth</h3>
                                        <p>{formatDate(patient.date_of_birth)}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Gender</h3>
                                        <p>{patient.gender}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Prescriber Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <h3 className="font-medium">Doctor</h3>
                                        <p>
                                            Dr. {doctor.first_name} {doctor.last_name}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Medical Record</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <h3 className="font-medium">Chief Complaint</h3>
                                        <p>{prescription.medical_records.chief_complaint}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Diagnosis</h3>
                                        <p>{prescription.medical_records.diagnosis}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href={`/medical-records/${prescription.medical_record_id}`}>View Medical Record</Link>
                                    </Button>
                                </CardFooter>
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
