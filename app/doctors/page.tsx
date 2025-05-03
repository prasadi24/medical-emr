import Link from "next/link"
import { getDoctors, getSpecialties } from "@/app/actions/doctor-actions"
import { getClinics } from "@/app/actions/clinic-actions"
import { getAllUsers } from "@/app/actions/user-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { DoctorsList } from "@/components/doctors/doctors-list"
import { Plus } from "lucide-react"

export default async function DoctorsPage() {
    const [doctors, users, specialties, clinics] = await Promise.all([
        getDoctors(),
        getAllUsers(),
        getSpecialties(),
        getClinics(),
    ])

    // Filter users who are not already doctors
    const doctorUserIds = doctors.map((doctor) => doctor.user_id)
    const availableUsers = users.filter((user) => !doctorUserIds.includes(user.id))

    return (
        <RequireRole roles={["Admin"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
                        <p className="text-muted-foreground">Manage doctor profiles and information</p>
                    </div>
                    <Button asChild>
                        <Link href="/doctors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Doctor
                        </Link>
                    </Button>
                </div>

                <DoctorsList doctors={doctors} availableUsers={availableUsers} specialties={specialties} clinics={clinics} />
            </div>
        </RequireRole>
    )
}
