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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileText, RefreshCw, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { deletePrescription } from "@/app/actions/prescription-actions"
import { useToast } from "@/hooks/use-toast"

interface PrescriptionsListProps {
    prescriptions: any[]
    showPatientName?: boolean
    medicalRecordId?: string
}

export function PrescriptionsList({ prescriptions, showPatientName = false, medicalRecordId }: PrescriptionsListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!medicalRecordId) return

        try {
            setIsDeleting(id)
            await deletePrescription(id, medicalRecordId)
            toast({
                title: "Prescription deleted",
                description: "The prescription has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting prescription:", error)
            toast({
                title: "Error",
                description: "Failed to delete prescription. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return <Badge className="bg-green-500">Active</Badge>
            case "completed":
                return <Badge className="bg-blue-500">Completed</Badge>
            case "discontinued":
                return <Badge className="bg-red-500">Discontinued</Badge>
            case "pending":
                return <Badge className="bg-yellow-500">Pending</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (prescriptions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Prescriptions</CardTitle>
                    <CardDescription>No prescriptions have been added yet.</CardDescription>
                </CardHeader>
                {medicalRecordId && (
                    <CardFooter>
                        <Button asChild>
                            <Link href={`/medical-records/${medicalRecordId}/prescriptions/new`}>Add Prescription</Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>Manage patient prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {showPatientName && <TableHead>Patient</TableHead>}
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Prescribed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {prescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                                {showPatientName && (
                                    <TableCell>
                                        <Link
                                            href={`/patients/${prescription.medical_records.patient_id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {prescription.medical_records.patients.first_name}{" "}
                                            {prescription.medical_records.patients.last_name}
                                        </Link>
                                    </TableCell>
                                )}
                                <TableCell>{prescription.medication_name}</TableCell>
                                <TableCell>{prescription.dosage}</TableCell>
                                <TableCell>{prescription.frequency}</TableCell>
                                <TableCell>{formatDate(prescription.prescribed_at)}</TableCell>
                                <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isDeleting === prescription.id}>
                                                {isDeleting === prescription.id ? (
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
                                                <Link href={`/prescriptions/${prescription.id}`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/prescriptions/${prescription.id}/edit`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/prescriptions/${prescription.id}/refill`}>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Refill
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(prescription.id)}
                                                disabled={isDeleting === prescription.id}
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
            {medicalRecordId && (
                <CardFooter>
                    <Button asChild>
                        <Link href={`/medical-records/${medicalRecordId}/prescriptions/new`}>Add Prescription</Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
