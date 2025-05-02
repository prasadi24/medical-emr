"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { deleteMedicalRecord } from "@/app/actions/medical-record-actions"
import { useAuth } from "@/contexts/auth-context"
import { MoreHorizontal } from "lucide-react"

type MedicalRecord = {
    id: string
    patient_id: string
    doctor_id: string
    visit_date: string
    chief_complaint: string
    diagnosis: string | null
    treatment_plan: string | null
    follow_up_date: string | null
    patients?: {
        id: string
        first_name: string
        last_name: string
    }
    doctor?: {
        email: string
    }
}

type MedicalRecordsListProps = {
    records: MedicalRecord[]
    patientId?: string
    showPatientName?: boolean
}

export function MedicalRecordsList({
    records: initialRecords,
    patientId,
    showPatientName = false,
}: MedicalRecordsListProps) {
    const [records, setRecords] = useState<MedicalRecord[]>(initialRecords)
    const router = useRouter()
    const { toast } = useToast()
    const { hasRole } = useAuth()

    const canEditRecord = hasRole("Admin") || hasRole("Doctor")
    const canDeleteRecord = hasRole("Admin")

    const handleDeleteRecord = async (recordId: string) => {
        if (confirm("Are you sure you want to delete this medical record? This action cannot be undone.")) {
            const result = await deleteMedicalRecord(recordId, patientId || "")

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setRecords(records.filter((record) => record.id !== recordId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {showPatientName && <TableHead>Patient</TableHead>}
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={showPatientName ? 6 : 5} className="text-center py-8">
                            No medical records found
                        </TableCell>
                    </TableRow>
                ) : (
                    records.map((record) => (
                        <TableRow key={record.id}>
                            {showPatientName && record.patients && (
                                <TableCell>
                                    <Link href={`/patients/${record.patients.id}`} className="hover:underline">
                                        {record.patients.first_name} {record.patients.last_name}
                                    </Link>
                                </TableCell>
                            )}
                            <TableCell>{formatDate(record.visit_date)}</TableCell>
                            <TableCell className="max-w-xs truncate">{record.chief_complaint}</TableCell>
                            <TableCell>{record.diagnosis || "Not specified"}</TableCell>
                            <TableCell>{formatDate(record.follow_up_date)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/medical-records/${record.id}`)}>
                                            View Details
                                        </DropdownMenuItem>
                                        {canEditRecord && (
                                            <DropdownMenuItem onClick={() => router.push(`/medical-records/${record.id}/edit`)}>
                                                Edit Record
                                            </DropdownMenuItem>
                                        )}
                                        {canDeleteRecord && (
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRecord(record.id)}>
                                                Delete Record
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
