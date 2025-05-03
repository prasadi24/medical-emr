"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { markNotificationAsRead } from "@/app/actions/patient-portal-actions"
import { useToast } from "@/hooks/use-toast"
import { Bell, MessageSquare, Calendar, FileText } from "lucide-react"

interface NotificationsListProps {
    notifications: any[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) {
            try {
                setIsLoading(notification.id)
                await markNotificationAsRead(notification.id)
            } catch (error) {
                console.error("Error marking notification as read:", error)
            } finally {
                setIsLoading(null)
            }
        }

        // Navigate based on notification type
        if (notification.reference_type === "patient_messages" && notification.reference_id) {
            router.push(`/messages/${notification.reference_id}`)
        } else if (notification.reference_type === "appointments" && notification.reference_id) {
            router.push(`/appointments/${notification.reference_id}`)
        } else if (notification.reference_type === "prescriptions" && notification.reference_id) {
            router.push(`/prescriptions/${notification.reference_id}`)
        } else {
            // Default to notifications page
            router.refresh()
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "message":
                return <MessageSquare className="h-4 w-4" />
            case "appointment":
                return <Calendar className="h-4 w-4" />
            case "prescription":
                return <FileText className="h-4 w-4" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    if (notifications.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Notifications</CardTitle>
                    <CardDescription>You don't have any notifications yet.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Your recent notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Type</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifications.map((notification) => (
                            <TableRow
                                key={notification.id}
                                className={`cursor-pointer ${!notification.is_read ? "font-medium" : ""}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <TableCell>{getNotificationIcon(notification.type)}</TableCell>
                                <TableCell>{notification.message}</TableCell>
                                <TableCell>{formatDate(notification.created_at)}</TableCell>
                                <TableCell>
                                    {!notification.is_read ? (
                                        <Badge className="bg-blue-500">New</Badge>
                                    ) : (
                                        <Badge variant="outline">Read</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
