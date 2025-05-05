"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, Calendar, DollarSign, Package } from 'lucide-react'

// Define the types for our stats
interface DashboardData {
    patientStats?: {
        totalPatients: number
        newPatientsThisMonth: number
        ageDistribution: Record<string, number>
        genderDistribution: Record<string, number>
    }
    appointmentStats?: {
        totalAppointments: number
        upcomingAppointments: number
        appointmentsByStatus: Record<string, number>
        appointmentsByType: Record<string, number>
    }
    billingStats?: {
        totalRevenue: number
        outstandingAmount: number
        revenueByMonth: Record<string, number>
        paymentStatus: Record<string, number>
    }
    inventoryStats?: {
        totalItems: number
        lowStockItems: number
        outOfStockItems: number
        itemsByCategory: Record<string, number>
    }
}

export function DashboardStats() {
    const [activeTab, setActiveTab] = useState("patients")
    const [data, setData] = useState<DashboardData>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Mock data for demonstration
    useEffect(() => {
        // In a real application, this would be an API call to fetch the data
        const fetchData = async () => {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Mock data
                setData({
                    patientStats: {
                        totalPatients: 1250,
                        newPatientsThisMonth: 45,
                        ageDistribution: {
                            "0-18": 230,
                            "19-35": 420,
                            "36-50": 310,
                            "51-65": 180,
                            "66+": 110
                        },
                        genderDistribution: {
                            "Male": 580,
                            "Female": 650,
                            "Other": 20
                        }
                    },
                    appointmentStats: {
                        totalAppointments: 3450,
                        upcomingAppointments: 120,
                        appointmentsByStatus: {
                            "Completed": 2800,
                            "Scheduled": 450,
                            "Cancelled": 150,
                            "No-show": 50
                        },
                        appointmentsByType: {
                            "Check-up": 1500,
                            "Follow-up": 1000,
                            "Emergency": 300,
                            "Consultation": 650
                        }
                    },
                    billingStats: {
                        totalRevenue: 450000,
                        outstandingAmount: 75000,
                        revenueByMonth: {
                            "Jan": 35000,
                            "Feb": 38000,
                            "Mar": 42000,
                            "Apr": 39000,
                            "May": 45000,
                            "Jun": 48000
                        },
                        paymentStatus: {
                            "Paid": 320000,
                            "Pending": 55000,
                            "Overdue": 75000
                        }
                    },
                    inventoryStats: {
                        totalItems: 850,
                        lowStockItems: 35,
                        outOfStockItems: 12,
                        itemsByCategory: {
                            "Medications": 350,
                            "Supplies": 280,
                            "Equipment": 120,
                            "Lab Materials": 100
                        }
                    }
                })
                setError(null)
            } catch (err) {
                console.error("Error fetching dashboard data:", err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                {/* Patients Tab */}
                <TabsContent value="patients" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-muted-foreground mr-2" />
                                        <div className="text-2xl font-bold">{data.patientStats?.totalPatients}</div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {loading ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `+${data.patientStats?.newPatientsThisMonth} new patients this month`
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-muted-foreground">Gender distribution chart would appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Age Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-muted-foreground">Age distribution chart would appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                                        <div className="text-2xl font-bold">{data.appointmentStats?.totalAppointments}</div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {loading ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `${data.appointmentStats?.upcomingAppointments} upcoming appointments`
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Appointment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-muted-foreground">Appointment status chart would appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-muted-foreground">Appointments by type chart would appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                                        <div className="text-2xl font-bold">${data.billingStats?.totalRevenue.toLocaleString()}</div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {loading ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `$${data.billingStats?.outstandingAmount.toLocaleString()} outstanding`
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-muted-foreground">Payment status chart would appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-muted-foreground">Revenue by month chart would appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-center">
                                        <Package className="h-5 w-5 text-muted-foreground mr-2" />
                                        <div className="text-2xl font-bold">{data.inventoryStats?.totalItems}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="text-2xl font-bold text-amber-500">{data.inventoryStats?.lowStockItems}</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="text-2xl font-bold text-red-500">{data.inventoryStats?.outOfStockItems}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-muted-foreground">Items by category chart would appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}