"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon } from "lucide-react"
import { getAuditLogById, getResourceName } from "@/app/actions/audit-log-actions"
import { useAuth } from "@/contexts/auth-context"

interface AuditLogDetailsProps {
    logId: string
}

export function AuditLogDetails({ logId }: AuditLogDetailsProps) {
    const router = useRouter()
    const { hasRole } = useAuth()
    const [log, setLog] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [resourceName, setResourceName] = useState<string>("")
    const [hasPermission, setHasPermission] = useState(hasRole("Admin"))

    useEffect(() => {
        setHasPermission(hasRole("Admin"))
    }, [hasRole])

    // Check if user has admin role
    if (!hasPermission) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <p>You do not have permission to view audit logs.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    useEffect(() => {
        const fetchLogDetails = async () => {
            setLoading(true)
            const logData = await getAuditLogById(logId)

            if (logData) {
                setLog(logData)

                // Get resource name if resource_id exists
                if (logData.resource_id && logData.resource_type) {
                    const name = await getResourceName(logData.resource_type, logData.resource_id)
                    setResourceName(name)
                }
            }

            setLoading(false)
        }

        fetchLogDetails()
    }, [logId])

    const getActionBadgeColor = (action: string) => {
        switch (action.toLowerCase()) {
            case "create":
                return "bg-green-100 text-green-800"
            case "update":
                return "bg-blue-100 text-blue-800"
            case "delete":
                return "bg-red-100 text-red-800"
            case "view":
                return "bg-gray-100 text-gray-800"
            case "login":
                return "bg-purple-100 text-purple-800"
            case "logout":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatDetails = (details: any) => {
        if (!details) return null

        // Handle changes object specially
        if (details.changes) {
            return (
                <div className="space-y-4">
                    {Object.entries(details).map(([key, value]) => {
                        if (key === "changes") {
                            return (
                                <div key={key} className="space-y-2">
                                    <h4 className="font-medium">Changes</h4>
                                    <div className="rounded-md border p-4">
                                        {Object.entries(value as Record<string, { before: any; after: any }>).map(([field, change]) => (
                                            <div key={field} className="mb-2">
                                                <div className="font-medium">{field}</div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Before</div>
                                                        <div className="rounded bg-red-50 p-2 text-sm">
                                                            {change.before === null ? (
                                                                <span className="italic text-muted-foreground">null</span>
                                                            ) : typeof change.before === "object" ? (
                                                                JSON.stringify(change.before, null, 2)
                                                            ) : (
                                                                String(change.before)
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">After</div>
                                                        <div className="rounded bg-green-50 p-2 text-sm">
                                                            {change.after === null ? (
                                                                <span className="italic text-muted-foreground">null</span>
                                                            ) : typeof change.after === "object" ? (
                                                                JSON.stringify(change.after, null, 2)
                                                            ) : (
                                                                String(change.after)
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div key={key}>
                                    <div className="font-medium">{key}</div>
                                    <div className="text-sm">
                                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            )
        }

        // Default rendering for other details
        return (
            <div className="space-y-2">
                {Object.entries(details).map(([key, value]) => (
                    <div key={key}>
                        <div className="font-medium">{key}</div>
                        <div className="text-sm">
                            {typeof value === "object" ? (
                                <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2">{JSON.stringify(value, null, 2)}</pre>
                            ) : (
                                String(value)
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                </CardContent>
            </Card>
        )
    }

    if (!log) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Audit log not found.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/audit-logs")}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Audit Logs
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Audit Log Details</CardTitle>
                    <Badge className={getActionBadgeColor(log.action)}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-2 font-medium">Date & Time</h3>
                        <p>{format(new Date(log.created_at), "PPpp")}</p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">User</h3>
                        <p>
                            {log.userProfile
                                ? `${log.userProfile.first_name || ""} ${log.userProfile.last_name || ""}`
                                : log.user?.email || "System"}
                            {log.user?.email && <span className="block text-sm text-muted-foreground">{log.user.email}</span>}
                        </p>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-2 font-medium">Resource Type</h3>
                        <p>{log.resource_type.charAt(0).toUpperCase() + log.resource_type.slice(1)}</p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">Resource ID</h3>
                        <p>{log.resource_id || "N/A"}</p>
                        {resourceName && <p className="text-sm text-muted-foreground">{resourceName}</p>}
                    </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-2 font-medium">IP Address</h3>
                        <p>{log.ip_address || "N/A"}</p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">User Agent</h3>
                        <p className="break-all text-sm">{log.user_agent || "N/A"}</p>
                    </div>
                </div>

                {log.details && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="mb-2 font-medium">Details</h3>
                            {formatDetails(log.details)}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => router.push("/audit-logs")}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Audit Logs
                </Button>
            </CardFooter>
        </Card>
    )
}
