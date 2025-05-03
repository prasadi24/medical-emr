import Link from "next/link"
import { getAppointments } from "@/app/actions/appointment-actions"
import { AppointmentsList } from "@/components/appointments/appointments-list"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function AppointmentsPage() {
    // Get today and next 7 days appointments by default
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const appointments = await getAppointments({
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
    })

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Receptionist"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground">View and manage appointments</p>
                    </div>
                    <Button asChild>
                        <Link href="/appointments/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Link>
                    </Button>
                </div>

                <AppointmentsList appointments={appointments} />
            </div>
        </RequireRole>
    )
}
