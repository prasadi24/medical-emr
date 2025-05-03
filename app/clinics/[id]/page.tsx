import Link from "next/link"
import { getClinicById } from "@/app/actions/clinic-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PencilIcon } from "lucide-react"
import { notFound } from "next/navigation"

export default async function ClinicDetailsPage({ params }: { params: { id: string } }) {
    const clinic = await getClinicById(params.id)

    if (!clinic) {
        notFound()
    }

    const formatOpeningHours = (openingHours: Record<string, { open: string; close: string }> | null) => {
        if (!openingHours) return "Not specified"

        return Object.entries(openingHours).map(([day, hours]) => (
            <div key={day} className="grid grid-cols-3 gap-4">
                <div className="font-medium">{day}</div>
                <div>{hours.open}</div>
                <div>{hours.close}</div>
            </div>
        ))
    }

    return (
        <RequireRole roles={["Admin"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{clinic.name}</h1>
                        <p className="text-muted-foreground">{clinic.address}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/clinics/${clinic.id}/edit`}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Clinic
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                <p>{clinic.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{clinic.email || "Not specified"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Website</p>
                                <p>
                                    {clinic.website ? (
                                        <a
                                            href={clinic.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {clinic.website}
                                        </a>
                                    ) : (
                                        "Not specified"
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Opening Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">{formatOpeningHours(clinic.opening_hours)}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Facilities</CardTitle>
                            <CardDescription>Available services and equipment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {clinic.facilities && clinic.facilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {clinic.facilities.map((facility: string, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                        >
                                            {facility}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No facilities specified</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireRole>
    )
}
