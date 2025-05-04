"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle, CheckCircle2, Clock, FileText, MoreVertical, Plus, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { deleteLabResult } from "@/app/actions/lab-result-actions"
import { useRouter } from "next/navigation"

// Update the interface to include the showPatientName prop
interface LabResultsListProps {
    labResults: any[]
    patientId?: string
    medicalRecordId?: string
    showPatientName?: boolean
}

// Update the function signature to include the new prop with a default value
export function LabResultsList({
    labResults,
    patientId,
    medicalRecordId,
    showPatientName = false,
}: LabResultsListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this lab result?")) {
            setIsDeleting(id)
            try {
                const result = await deleteLabResult(id)
                if (result.success) {
                    toast({
                        title: "Success",
                        description: result.message,
                    })
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    })
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete lab result",
                    variant: "destructive",
                })
            } finally {
                setIsDeleting(null)
            }
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ordered":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Ordered
                    </Badge>
                )
            case "in_progress":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        In Progress
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completed
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ordered":
                return <Clock className="h-4 w-4 text-blue-500" />
            case "in_progress":
                return <Clock className="h-4 w-4 text-yellow-500" />
            case "completed":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "cancelled":
                return <AlertCircle className="h-4 w-4 text-gray-500" />
            default:
                return null
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lab Results</CardTitle>
                <Button size="sm" asChild>
                    <Link
                        href={
                            medicalRecordId
                                ? `/medical-records/${medicalRecordId}/lab-results/new`
                                : patientId
                                    ? `/patients/${patientId}/lab-results/new`
                                    : "/lab-results/new"
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Order New Test
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {labResults.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">No lab results found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test</TableHead>
                                {showPatientName && <TableHead>Patient</TableHead>}
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {labResults.map((labResult) => (
                                <TableRow key={labResult.id} className={labResult.is_abnormal ? "bg-red-50" : ""}>
                                    <TableCell>
                                        <div className="font-medium">{labResult.lab_test_type?.name || "Unknown Test"}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {labResult.lab_test_type?.lab_test_categories?.name || "Uncategorized"}
                                        </div>
                                    </TableCell>
                                    {showPatientName && (
                                        <TableCell>
                                            <Link href={`/patients/${labResult.patient_id}`} className="hover:underline">
                                                {labResult.patient?.first_name} {labResult.patient?.last_name}
                                            </Link>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div>{formatDate(labResult.test_date)}</div>
                                        {labResult.result_date && (
                                            <div className="text-sm text-muted-foreground">Results: {formatDate(labResult.result_date)}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(labResult.status)}
                                            {getStatusBadge(labResult.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {labResult.status === "completed" ? (
                                            <div>
                                                <div className={labResult.is_abnormal ? "font-bold text-red-600" : ""}>
                                                    {labResult.result} {labResult.unit}
                                                </div>
                                                {labResult.is_abnormal && (
                                                    <div className="text-sm text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Abnormal
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Pending</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" disabled={isDeleting === labResult.id}>
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/lab-results/${labResult.id}`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/lab-results/${labResult.id}/edit`}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Update Result
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(labResult.id)}
                                                    disabled={isDeleting === labResult.id}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {isDeleting === labResult.id ? "Deleting..." : "Delete"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
