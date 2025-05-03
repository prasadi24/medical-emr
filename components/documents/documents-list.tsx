"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, FileText, Download, Trash2, ExternalLink } from "lucide-react"
import { formatDate, formatFileSize } from "@/lib/utils"
import { deleteDocument } from "@/app/actions/document-actions"
import { useToast } from "@/hooks/use-toast"

interface DocumentsListProps {
    documents: any[]
    showPatientName?: boolean
    patientId?: string
    medicalRecordId?: string
}

export function DocumentsList({ documents, showPatientName = false, patientId, medicalRecordId }: DocumentsListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id)
            let redirectPath = "/documents"
            if (medicalRecordId) {
                redirectPath = `/medical-records/${medicalRecordId}`
            } else if (patientId) {
                redirectPath = `/patients/${patientId}`
            }

            await deleteDocument(id, redirectPath)
            toast({
                title: "Document deleted",
                description: "The document has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting document:", error)
            toast({
                title: "Error",
                description: "Failed to delete document. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(null)
        }
    }

    const getDocumentTypeIcon = (fileType: string) => {
        if (fileType.includes("pdf")) {
            return "📄"
        } else if (fileType.includes("image")) {
            return "🖼️"
        } else if (fileType.includes("text")) {
            return "📝"
        } else {
            return "📎"
        }
    }

    if (documents.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Documents</CardTitle>
                    <CardDescription>No documents have been uploaded yet.</CardDescription>
                </CardHeader>
                {(patientId || medicalRecordId) && (
                    <CardFooter>
                        <Button asChild>
                            <Link
                                href={
                                    medicalRecordId
                                        ? `/medical-records/${medicalRecordId}/documents/upload`
                                        : `/patients/${patientId}/documents/upload`
                                }
                            >
                                Upload Document
                            </Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Manage patient documents</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            {showPatientName && <TableHead>Patient</TableHead>}
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((document) => (
                            <TableRow key={document.id}>
                                <TableCell>
                                    <span className="text-2xl" title={document.file_type}>
                                        {getDocumentTypeIcon(document.file_type)}
                                    </span>
                                </TableCell>
                                <TableCell>{document.name}</TableCell>
                                {showPatientName && document.patients && (
                                    <TableCell>
                                        <Link href={`/patients/${document.patient_id}`} className="text-blue-600 hover:underline">
                                            {document.patients.first_name} {document.patients.last_name}
                                        </Link>
                                    </TableCell>
                                )}
                                <TableCell>
                                    {document.uploaded_by_user?.user_profiles?.first_name || document.uploaded_by_user?.email || "System"}
                                </TableCell>
                                <TableCell>{formatDate(document.created_at)}</TableCell>
                                <TableCell>{formatFileSize(document.file_size)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isDeleting === document.id}>
                                                {isDeleting === document.id ? (
                                                    <span className="animate-spin">⏳</span>
                                                ) : (
                                                    <MoreHorizontal className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/documents/${document.id}`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <a href={document.file_path} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Open File
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <a href={document.file_path} download>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(document.id)}
                                                disabled={isDeleting === document.id}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {(patientId || medicalRecordId) && (
                <CardFooter>
                    <Button asChild>
                        <Link
                            href={
                                medicalRecordId
                                    ? `/medical-records/${medicalRecordId}/documents/upload`
                                    : `/patients/${patientId}/documents/upload`
                            }
                        >
                            Upload Document
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
