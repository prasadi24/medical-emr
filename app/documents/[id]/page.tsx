import Link from "next/link"
import { notFound } from "next/navigation"
import { getDocumentById } from "@/app/actions/document-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatFileSize } from "@/lib/utils"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"

export default async function DocumentDetailsPage({ params }: { params: { id: string } }) {
    try {
        const document = await getDocumentById(params.id)

        if (!document) {
            notFound()
        }

        return (
            <RequireRole roles={["Admin", "Doctor", "Nurse", "Medical Records"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/documents">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" asChild>
                                <a href={document.file_path} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open File
                                </a>
                            </Button>
                            <Button asChild>
                                <a href={document.file_path} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Information</CardTitle>
                                <CardDescription>Details about this document</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Name</h3>
                                    <p className="text-lg">{document.name}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Type</h3>
                                    <p>{document.document_types?.name || "Unknown"}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">File Type</h3>
                                    <p>{document.file_type}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">File Size</h3>
                                    <p>{formatFileSize(document.file_size)}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Upload Date</h3>
                                    <p>{formatDate(document.created_at)}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Uploaded By</h3>
                                    <p>
                                        {document.uploaded_by?.user_profiles?.first_name
                                            ? `${document.uploaded_by.user_profiles.first_name} ${document.uploaded_by.user_profiles.last_name}`
                                            : document.uploaded_by?.email || "System"}
                                    </p>
                                </div>
                                {document.tags && document.tags.length > 0 && (
                                    <div>
                                        <h3 className="font-medium">Tags</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {document.tags.map((tag: string, index: number) => (
                                                <Badge key={index} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {document.patients && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Patient Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <h3 className="font-medium">Name</h3>
                                            <p>
                                                <Link href={`/patients/${document.patient_id}`} className="text-blue-600 hover:underline">
                                                    {document.patients.first_name} {document.patients.last_name}
                                                </Link>
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Date of Birth</h3>
                                            <p>{formatDate(document.patients.date_of_birth)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {document.medical_records && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Medical Record</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <h3 className="font-medium">Visit Date</h3>
                                            <p>{formatDate(document.medical_records.visit_date)}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Chief Complaint</h3>
                                            <p>{document.medical_records.chief_complaint}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Diagnosis</h3>
                                            <p>{document.medical_records.diagnosis}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href={`/medical-records/${document.medical_record_id}`}>View Medical Record</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {document.is_template_generated && document.document_templates && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Template Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <h3 className="font-medium">Template Name</h3>
                                            <p>{document.document_templates.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {document.file_type.includes("image") && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <img
                                    src={document.file_path || "/placeholder.svg"}
                                    alt={document.name}
                                    className="max-w-full max-h-[500px] object-contain border rounded-md"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {document.file_type.includes("pdf") && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <iframe src={document.file_path} className="w-full h-[600px] border rounded-md" title={document.name} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching document:", error)
        notFound()
    }
}
