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
import { deleteClinic } from "@/app/actions/clinic-actions"
import { Building2, MoreHorizontal, Phone, Search } from "lucide-react"

type Clinic = {
    id: string
    name: string
    address: string
    phone_number: string
    email: string | null
    website: string | null
    opening_hours: Record<string, { open: string; close: string }> | null
    facilities: string[] | null
}

type ClinicsListProps = {
    clinics: Clinic[]
}

export function ClinicsList({ clinics: initialClinics }: ClinicsListProps) {
    const [clinics, setClinics] = useState<Clinic[]>(initialClinics)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    const { toast } = useToast()

    const handleDeleteClinic = async (clinicId: string) => {
        if (confirm("Are you sure you want to delete this clinic? This action cannot be undone.")) {
            const result = await deleteClinic(clinicId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setClinics(clinics.filter((clinic) => clinic.id !== clinicId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const filteredClinics = clinics.filter((clinic) => {
        return clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search clinics..."
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
                                <TableHead>Address</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Facilities</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClinics.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        {searchTerm ? "No clinics found matching your search" : "No clinics found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClinics.map((clinic) => (
                                    <TableRow key={clinic.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/clinics/${clinic.id}`} className="hover:underline flex items-center">
                                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {clinic.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{clinic.address}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {clinic.phone_number}
                                            </div>
                                            {clinic.email && <div className="text-sm text-muted-foreground">{clinic.email}</div>}
                                        </TableCell>
                                        <TableCell>
                                            {clinic.facilities && clinic.facilities.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {clinic.facilities.slice(0, 3).map((facility, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                                        >
                                                            {facility}
                                                        </span>
                                                    ))}
                                                    {clinic.facilities.length > 3 && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                            +{clinic.facilities.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/clinics/${clinic.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/clinics/${clinic.id}/edit`)}>
                                                        Edit Clinic
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClinic(clinic.id)}>
                                                        Delete Clinic
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
