"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { deletePatient } from "@/app/actions/patient-actions"
import { useAuth } from "@/contexts/auth-context"
import { MoreHorizontal, Plus, Search } from "lucide-react"

type Patient = {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
    phone_number: string | null
    email: string | null
}

type PatientsListProps = {
    patients: Patient[]
}

export function PatientsList({ patients: initialPatients }: PatientsListProps) {
    const [patients, setPatients] = useState<Patient[]>(initialPatients)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    const { toast } = useToast()
    const { hasRole } = useAuth()

    const canCreatePatient = hasRole("Admin") || hasRole("Receptionist")
    const canEditPatient = hasRole("Admin") || hasRole("Receptionist")
    const canDeletePatient = hasRole("Admin")

    const handleDeletePatient = async (patientId: string) => {
        if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
            const result = await deletePatient(patientId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setPatients(patients.filter((patient) => patient.id !== patientId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const filteredPatients = patients.filter((patient) => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
        return fullName.includes(searchTerm.toLowerCase())
    })

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search patients..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {canCreatePatient && (
                    <Button onClick={() => router.push("/patients/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Patient
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Date of Birth</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPatients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        {searchTerm ? "No patients found matching your search" : "No patients found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/patients/${patient.id}`} className="hover:underline">
                                                {patient.first_name} {patient.last_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                                        <TableCell>{patient.gender}</TableCell>
                                        <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                                        <TableCell>{patient.email || patient.phone_number || "No contact info"}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {canEditPatient && (
                                                        <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/edit`)}>
                                                            Edit Patient
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/medical-records`)}>
                                                        View Medical Records
                                                    </DropdownMenuItem>
                                                    {canDeletePatient && (
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePatient(patient.id)}>
                                                            Delete Patient
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
                </CardContent>
            </Card>
        </div>
    )
}
