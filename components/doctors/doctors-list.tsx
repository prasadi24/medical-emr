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
import { deleteDoctor } from "@/app/actions/doctor-actions"
import { MoreHorizontal, Search, Stethoscope } from "lucide-react"

type Doctor = {
    id: string
    user_id: string
    specialty_id: number | null
    license_number: string
    employment_type_id: number | null
    clinic_id: string | null
    consultation_fee: number | null
    education: string[] | null
    experience: number | null
    bio: string | null
    languages: string[] | null
    available_days: string[] | null
    available_hours: Record<string, { start: string; end: string }[]> | null
    user: {
        email: string
    }
    specialty: {
        name: string
    } | null
    employment_type: {
        name: string
    } | null
    clinic: {
        name: string
    } | null
    profile: {
        first_name: string | null
        last_name: string | null
    }
}

type User = {
    id: string
    email: string
    firstName: string
    lastName: string
}

type Specialty = {
    id: number
    name: string
}

type Clinic = {
    id: string
    name: string
}

type DoctorsListProps = {
    doctors: Doctor[]
    availableUsers: User[]
    specialties: Specialty[]
    clinics: Clinic[]
}

export function DoctorsList({ doctors: initialDoctors, availableUsers, specialties, clinics }: DoctorsListProps) {
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    const { toast } = useToast()

    const handleDeleteDoctor = async (doctorId: string) => {
        if (confirm("Are you sure you want to delete this doctor profile? This action cannot be undone.")) {
            const result = await deleteDoctor(doctorId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setDoctors(doctors.filter((doctor) => doctor.id !== doctorId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const filteredDoctors = doctors.filter((doctor) => {
        const fullName = `${doctor.profile?.first_name || ""} ${doctor.profile?.last_name || ""}`.toLowerCase()
        const email = doctor.user?.email.toLowerCase()
        const specialty = doctor.specialty?.name.toLowerCase() || ""

        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase()) ||
            specialty.includes(searchTerm.toLowerCase())
        )
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search doctors..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Clinic</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDoctors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        {searchTerm ? "No doctors found matching your search" : "No doctors found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/doctors/${doctor.id}`} className="hover:underline flex items-center">
                                                <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {doctor.profile?.first_name} {doctor.profile?.last_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">{doctor.user?.email}</div>
                                        </TableCell>
                                        <TableCell>{doctor.specialty?.name || "Not specified"}</TableCell>
                                        <TableCell>{doctor.clinic?.name || "Not assigned"}</TableCell>
                                        <TableCell>{doctor.license_number}</TableCell>
                                        <TableCell>{doctor.experience ? `${doctor.experience} years` : "Not specified"}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/doctors/${doctor.id}`)}>
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/doctors/${doctor.id}/edit`)}>
                                                        Edit Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDoctor(doctor.id)}>
                                                        Delete Profile
                                                    </DropdownMenuItem>
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
