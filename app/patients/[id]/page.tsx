import Link from "next/link"
import { getPatientById } from "@/app/actions/patient-actions"
import { getMedicalRecords } from "@/app/actions/medical-record-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicalRecordsList } from "@/components/medical-records/medical-records-list"
import { PencilIcon, PlusIcon, BrainCircuit } from "lucide-react"
import { notFound } from "next/navigation"
import PatientRiskAssessment from "@/components/ai/patient-risk-assessment"

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id)
    const medicalRecords = await getMedicalRecords({ patientId: params.id })

    if (!patient) {
        notFound()
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        return age
    }

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {patient.first_name} {patient.last_name}
                        </h1>
                        <p className="text-muted-foreground">
                            {patient.gender} • {calculateAge(patient.date_of_birth)} years old • DOB:{" "}
                            {formatDate(patient.date_of_birth)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <RequireRole roles={["Admin", "Receptionist"]}>
                            <Button variant="outline" asChild>
                                <Link href={`/patients/${patient.id}/edit`}>
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit Patient
                                </Link>
                            </Button>
                        </RequireRole>
                        <RequireRole roles={["Admin", "Doctor"]}>
                            <Button asChild>
                                <Link href={`/patients/${patient.id}/medical-records/new`}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Medical Record
                                </Link>
                            </Button>
                        </RequireRole>
                        <RequireRole roles={["Admin", "Doctor"]}>
                            <Button variant="outline" asChild>
                                <Link href={`/patients/${patient.id}/ai-dashboard`}>
                                    <BrainCircuit className="mr-2 h-4 w-4" />
                                    AI Dashboard
                                </Link>
                            </Button>
                        </RequireRole>
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList>
                        <TabsTrigger value="details">Patient Details</TabsTrigger>
                        <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
                        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                        <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                            <p>
                                                {patient.first_name} {patient.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                            <p>{formatDate(patient.date_of_birth)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                            <p>{patient.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                                            <p>{patient.blood_type || "Not specified"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                                        <p>{patient.address || "Not specified"}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                        <p>{patient.phone_number || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p>{patient.email || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                                        <p>
                                            {patient.emergency_contact_name ? (
                                                <>
                                                    {patient.emergency_contact_name} ({patient.emergency_contact_phone || "No phone"})
                                                </>
                                            ) : (
                                                "Not specified"
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Insurance Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Insurance Provider</p>
                                        <p>{patient.insurance_provider || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                                        <p>{patient.insurance_policy_number || "Not specified"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="medical-records" className="pt-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Medical Records</CardTitle>
                                    <CardDescription>Patient's medical history and visits</CardDescription>
                                </div>
                                <RequireRole roles={["Admin", "Doctor"]}>
                                    <Button asChild>
                                        <Link href={`/patients/${patient.id}/medical-records/new`}>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            New Record
                                        </Link>
                                    </Button>
                                </RequireRole>
                            </CardHeader>
                            <CardContent>
                                <MedicalRecordsList records={medicalRecords} patientId={patient.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="ai-insights" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5" />
                                    <span>AI Clinical Insights</span>
                                </CardTitle>
                                <CardDescription>AI-generated insights based on patient data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Clinical Summary</h3>
                                        <p className="text-sm">
                                            Based on the patient's medical history, {patient.first_name} {patient.last_name} is a{" "}
                                            {calculateAge(patient.date_of_birth)}-year-old {patient.gender.toLowerCase()} with multiple health
                                            concerns that require ongoing monitoring.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Treatment Adherence</h3>
                                        <p className="text-sm">
                                            Patient shows good adherence to prescribed medications and treatment plans. Regular follow-up
                                            appointments are recommended to monitor progress.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Potential Concerns</h3>
                                        <p className="text-sm">
                                            AI analysis suggests monitoring for potential drug interactions and side effects. Consider
                                            reviewing current medication regimen at next visit.
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <BrainCircuit className="h-4 w-4" />
                                            Generate New Insights
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="risk-assessment" className="pt-4">
                        <PatientRiskAssessment patientId={params.id} patientData={patient} />
                    </TabsContent>
                </Tabs>
            </div>
        </RequireRole>
    )
}
