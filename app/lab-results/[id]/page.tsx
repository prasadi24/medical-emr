import Link from "next/link"
import { notFound } from "next/navigation"
import { getLabResultById } from "@/app/actions/lab-result-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit, AlertTriangle } from "lucide-react"

export default async function LabResultDetailsPage({ params }: { params: { id: string } }) {
    try {
        const labResult = await getLabResultById(params.id)

        if (!labResult) {
            notFound()
        }

        const getStatusBadge = (status: string) => {
            switch (status) {
                case "ordered":
                    return <Badge variant="outline">Ordered</Badge>
                case "in_progress":
                    return <Badge variant="secondary">In Progress</Badge>
                case "completed":
                    return <Badge variant="default">Completed</Badge>
                case "cancelled":
                    return <Badge variant="destructive">Cancelled</Badge>
                default:
                    return <Badge variant="outline">{status}</Badge>
            }
        }

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Lab Technician"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/lab-results">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Lab Result Details</h1>
                        </div>
                        {labResult.status !== "completed" && (
                            <Button asChild>
                                <Link href={`/lab-results/${labResult.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Result
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Information</CardTitle>
                                <CardDescription>Details about this lab test</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Test Name</h3>
                                    <p className="text-lg">{labResult.lab_test_types?.name}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Category</h3>
                                    <p>{labResult.lab_test_types?.lab_test_categories?.name}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Description</h3>
                                    <p>{labResult.lab_test_types?.description || "No description available"}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Status</h3>
                                    <div className="mt-1">{getStatusBadge(labResult.status)}</div>
                                </div>
                                <div>
                                    <h3 className="font-medium">Test Date</h3>
                                    <p>{formatDate(labResult.test_date)}</p>
                                </div>
                                {labResult.result_date && (
                                    <div>
                                        <h3 className="font-medium">Result Date</h3>
                                        <p>{formatDate(labResult.result_date)}</p>
                                    </div>
                                )}
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
                                            <Link href={`/patients/${labResult.patient_id}`} className="text-blue-600 hover:underline">
                                                {labResult.patients?.first_name} {labResult.patients?.last_name}
                                            </Link>
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Date of Birth</h3>
                                        <p>{formatDate(labResult.patients?.date_of_birth)}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href={`/patients/${labResult.patient_id}`}>View Patient</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            {labResult.medical_record_id && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Medical Record</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <h3 className="font-medium">Visit Date</h3>
                                            <p>{formatDate(labResult.medical_records?.visit_date)}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Chief Complaint</h3>
                                            <p>{labResult.medical_records?.chief_complaint}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href={`/medical-records/${labResult.medical_record_id}`}>View Medical Record</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    </div>

                    {labResult.status === "completed" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Result
                                    {labResult.is_abnormal && (
                                        <span className="text-red-600 flex items-center gap-1">
                                            <AlertTriangle className="h-5 w-5" />
                                            Abnormal
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h3 className="font-medium">Result Value</h3>
                                        <p className={`text-xl ${labResult.is_abnormal ? "text-red-600 font-medium" : ""}`}>
                                            {labResult.result} {labResult.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Normal Range</h3>
                                        <p>
                                            {labResult.lab_test_types?.normal_range || "Not specified"} {labResult.lab_test_types?.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Performed By</h3>
                                        <p>
                                            {labResult.performed_by?.user?.user_profiles?.first_name}{" "}
                                            {labResult.performed_by?.user?.user_profiles?.last_name} ({labResult.performed_by?.role})
                                        </p>
                                    </div>
                                </div>
                                {labResult.notes && (
                                    <div>
                                        <h3 className="font-medium">Notes</h3>
                                        <p className="whitespace-pre-wrap">{labResult.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Ordered By</h3>
                                <p>
                                    Dr. {labResult.ordered_by?.user?.user_profiles?.first_name}{" "}
                                    {labResult.ordered_by?.user?.user_profiles?.last_name} ({labResult.ordered_by?.specialty})
                                </p>
                            </div>
                            {labResult.notes && labResult.status !== "completed" && (
                                <div>
                                    <h3 className="font-medium">Notes</h3>
                                    <p className="whitespace-pre-wrap">{labResult.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching lab result:", error)
        notFound()
    }
}
