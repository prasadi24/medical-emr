"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, ClipboardListIcon, UsersIcon } from "lucide-react"

export default function DashboardPage() {
    const { user, hasRole } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Patients Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">1,248</div>}
                    </CardContent>
                </Card>

                {/* Appointments Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">24</div>}
                    </CardContent>
                </Card>

                {/* Medical Records Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Records</CardTitle>
                        <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">36</div>}
                    </CardContent>
                </Card>
            </div>

            {/* Role-specific content */}
            {hasRole("Admin") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>
                            You have admin privileges. You can manage users, roles, and system settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>System Status: Online</p>
                                <p>Last Backup: Today at 03:00 AM</p>
                                <p>Active Users: 42</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {hasRole("Doctor") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Dashboard</CardTitle>
                        <CardDescription>View your upcoming appointments and patient records.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>Next Appointment: John Doe at 10:30 AM</p>
                                <p>Pending Lab Results: 5</p>
                                <p>Prescriptions to Review: 3</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {hasRole("Nurse") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nurse Dashboard</CardTitle>
                        <CardDescription>Manage patient vitals and assist with medical procedures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>Patients to Check: 8</p>
                                <p>Medication Administration: 12</p>
                                <p>Vitals to Record: 5</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {hasRole("Receptionist") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Receptionist Dashboard</CardTitle>
                        <CardDescription>Manage appointments and patient check-ins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>Upcoming Check-ins: 6</p>
                                <p>Appointment Requests: 3</p>
                                <p>Insurance Verifications: 4</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
