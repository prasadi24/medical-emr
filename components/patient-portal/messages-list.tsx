"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { markMessageAsRead } from "@/app/actions/patient-portal-actions"
import { useToast } from "@/hooks/use-toast"

interface MessagesListProps {
    messages: any[]
    patientId: string
}

export function MessagesList({ messages, patientId }: MessagesListProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleViewMessage = async (id: string, isRead: boolean) => {
        if (!isRead) {
            try {
                setIsLoading(id)
                await markMessageAsRead(id)
            } catch (error) {
                console.error("Error marking message as read:", error)
            } finally {
                setIsLoading(null)
            }
        }

        router.push(`/messages/${id}`)
    }

    const getSenderName = (message: any) => {
        if (message.sender_type === "patient") {
            return `${message.patient.first_name} ${message.patient.last_name}`
        } else if (message.sender_type === "doctor" && message.doctor) {
            return `Dr. ${message.doctor.user_profiles.first_name} ${message.doctor.user_profiles.last_name}`
        } else if (message.sender_type === "staff" && message.staff) {
            return `${message.staff.user_profiles.first_name} ${message.staff.user_profiles.last_name} (${message.staff.position})`
        }
        return "System"
    }

    if (messages.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Messages</CardTitle>
                    <CardDescription>You don't have any messages yet.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/messages/new">New Message</Link>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>View and manage your messages</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>From/To</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Replies</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.map((message) => (
                            <TableRow
                                key={message.id}
                                className={`cursor-pointer ${!message.is_read ? "font-medium" : ""}`}
                                onClick={() => handleViewMessage(message.id, message.is_read)}
                            >
                                <TableCell>
                                    {!message.is_read ? (
                                        <Badge className="bg-blue-500">New</Badge>
                                    ) : (
                                        <Badge variant="outline">Read</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{message.subject}</TableCell>
                                <TableCell>
                                    {message.sender_type === "patient" ? "You → Staff" : `${getSenderName(message)} → You`}
                                </TableCell>
                                <TableCell>{formatDate(message.created_at)}</TableCell>
                                <TableCell>
                                    {message.replies && message.replies.length > 0 ? (
                                        <Badge variant="outline">{message.replies.length}</Badge>
                                    ) : (
                                        "0"
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <Button asChild>
                    <Link href="/messages/new">New Message</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
