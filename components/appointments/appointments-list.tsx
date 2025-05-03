"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { deleteAppointment, updateAppointmentStatus } from "@/app/actions/appointment-actions"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MoreHorizontal, Search } from "lucide-react"

type Appointment = {
    id: string
    patient_id: string
    doctor_id: string
    clinic_id: string
    appointment_date: string
    duration: number
    status: string
    type: string
    reason: string | null
    notes: string | null
    patient: {
        id: string
        first_name: string
        last_name: string
    }
    doctor: {
        id: string
        user_id: string
        user: {
            email: string
        }
        specialty: {
            name: string
        } | null
        profile: {
            first_name: string | null
            last_name: string | null
        }
    }
    clinic: {
        id: string
        name: string
    }
}

type AppointmentsListProps = {
    appointments: Appointment[]
    showPatientName?: boolean
    showDoctorName?: boolean
    showClinicName?: boolean
    patientId?: string
}

export function AppointmentsList({
    appointments: initialAppointments,
    showPatientName = true,
    showDoctorName = true,
    showClinicName = true,
    patientId,
}: AppointmentsListProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const router = useRouter()
    const { toast } = useToast()
    const { hasRole } = useAuth()

    const canEditAppointment = hasRole("Admin") || hasRole("Receptionist") || hasRole("Doctor")
    const canDeleteAppointment = hasRole("Admin") || hasRole("Receptionist")
    const canUpdateStatus = hasRole("Admin") || hasRole("Receptionist") || hasRole("Doctor") || hasRole("Nurse")

    const handleDeleteAppointment = async (appointmentId: string, patientId: string) => {
        if (confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
            const result = await deleteAppointment(appointmentId, patientId)

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                })
                setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId))
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                })
            }
        }
    }

    const handleUpdateStatus = async (appointmentId: string, status: string) => {
        const result = await updateAppointmentStatus(appointmentId, status)

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
            })
            setAppointments(
                appointments.map((appointment) =>
                    appointment.id === appointmentId ? { ...appointment, status } : appointment,
                ),
            )
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            })
        }
    }

    const filteredAppointments = appointments.filter((appointment) => {
        const doctorName = `${appointment.doctor?.profile?.first_name || ""} ${appointment.doctor?.profile?.last_name || ""
            }`.toLowerCase()
        const patientName = `${appointment.patient?.first_name || ""} ${appointment.patient?.last_name || ""}`.toLowerCase()
        const clinicName = appointment.clinic?.name.toLowerCase() || ""
        const type = appointment.type.toLowerCase()

        const matchesSearch =
            doctorName.includes(searchTerm.toLowerCase()) ||
            patientName.includes(searchTerm.toLowerCase()) ||
            clinicName.includes(searchTerm.toLowerCase()) ||
            type.includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "scheduled":
                return "outline"
            case "confirmed":
                return "secondary"
            case "completed":
                return "default"
            case "cancelled":
                return "destructive"
            case "no-show":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search appointments..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center">
                    <select
                        className="border rounded p-1.5"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                    </select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                {showPatientName && <TableHead>Patient</TableHead>}
                                {showDoctorName && <TableHead>Doctor</TableHead>}
                                {showClinicName && <TableHead>Clinic</TableHead>}
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        {searchTerm || statusFilter !== "all"
                                            ? "No appointments found matching your filters"
                                            : "No appointments found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAppointments.map((appointment) => {
                                    const { date, time } = formatDateTime(appointment.appointment_date)
                                    return (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center font-medium">
                                                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                                                        {date}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {time} ({appointment.duration} min)
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {showPatientName && (
                                                <TableCell>
                                                    <Link href={`/patients/${appointment.patient.id}`} className="hover:underline">
                                                        {appointment.patient.first_name} {appointment.patient.last_name}
                                                    </Link>
                                                </TableCell>
                                            )}
                                            {showDoctorName && (
                                                <TableCell>
                                                    <div>
                                                        {appointment.doctor.profile?.first_name} {appointment.doctor.profile?.last_name}
                                                    </div>
                                                    {appointment.doctor.specialty && (
                                                        <div className="text-xs text-muted-foreground">{appointment.doctor.specialty.name}</div>
                                                    )}
                                                </TableCell>
                                            )}
                                            {showClinicName && <TableCell>{appointment.clinic.name}</TableCell>}
                                            <TableCell>
                                                <span className="capitalize">{appointment.type}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize">
                                                    {appointment.status}
                                                </Badge>
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
                                                        <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}`)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {canEditAppointment && (
                                                            <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}/edit`)}>
                                                                Edit Appointment
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canUpdateStatus && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                                                                    disabled={appointment.status === "confirmed"}
                                                                >
                                                                    Mark as Confirmed
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(appointment.id, "completed")}
                                                                    disabled={appointment.status === "completed"}
                                                                >
                                                                    Mark as Completed
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(appointment.id, "cancelled")}
                                                                    disabled={appointment.status === "cancelled"}
                                                                >
                                                                    Mark as Cancelled
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(appointment.id, "no-show")}
                                                                    disabled={appointment.status === "no-show"}
                                                                >
                                                                    Mark as No-Show
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {canDeleteAppointment && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteAppointment(appointment.id, appointment.patient_id)}
                                                            >
                                                                Delete Appointment
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
