import Link from "next/link"
import { getAppointmentById } from "@/app/actions/appointment-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, CalendarIcon, MapPinIcon, UserIcon, StethoscopeIcon, ClipboardIcon } from "lucide-react"
import { notFound } from "next/navigation"

export default async function AppointmentDetailsPage({ params }: { params: { id: string } }) {
    const appointment = await getAppointmentById(params.id)

    if (!appointment) {
        notFound()
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
    }

    const { date, time } = formatDateTime(appointment.appointment_date)

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
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
                        <p className="text-muted-foreground">
                            {date} at {time}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/appointments/${appointment.id}/edit`}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Appointment
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/appointments">Go to Appointments</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Information</CardTitle>
                            <CardDescription>Details about this appointment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Date & Time</h3>
                                    <p>{date}</p>
                                    <p>
                                        {time} ({appointment.duration} minutes)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                    <ClipboardIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Type & Status</h3>
                                    <p className="capitalize">{appointment.type.replace("-", " ")}</p>
                                    <Badge variant={getStatusBadgeVariant(appointment.status)} className="mt-1 capitalize">
                                        {appointment.status}
                                    </Badge>
                                </div>
                            </div>
                            {(appointment.reason || appointment.notes) && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                        <ClipboardIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        {appointment.reason && (
                                            <>
                                                <h3 className="font-medium">Reason for Visit</h3>
                                                <p>{appointment.reason}</p>
                                            </>
                                        )}
                                        {appointment.notes && (
                                            <>
                                                <h3 className="font-medium mt-2">Additional Notes</h3>
                                                <p>{appointment.notes}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient & Doctor Information</CardTitle>
                            <CardDescription>People involved in this appointment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Patient</h3>
                                    <p>
                                        <Link href={`/patients/${appointment.patient.id}`} className="hover:underline text-primary">
                                            {appointment.patient.first_name} {appointment.patient.last_name}
                                        </Link>
                                    </p>
                                    {appointment.patient.email && <p className="text-sm">{appointment.patient.email}</p>}
                                    {appointment.patient.phone_number && <p className="text-sm">{appointment.patient.phone_number}</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                    <StethoscopeIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Doctor</h3>
                                    <p>
                                        {appointment.doctor.profile?.first_name} {appointment.doctor.profile?.last_name}
                                    </p>
                                    {appointment.doctor.specialty && <p className="text-sm">{appointment.doctor.specialty.name}</p>}
                                    <p className="text-sm">{appointment.doctor.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                    <MapPinIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Clinic</h3>
                                    <p>{appointment.clinic.name}</p>
                                    <p className="text-sm">{appointment.clinic.address}</p>
                                    <p className="text-sm">{appointment.clinic.phone_number}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireRole>
    )
}
