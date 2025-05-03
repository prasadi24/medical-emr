import type { Metadata } from "next"
import { AuditLogDetails } from "@/components/audit-logs/audit-log-details"
import { RequireRole } from "@/components/auth/require-role"

export const metadata: Metadata = {
    title: "Audit Log Details | Medical EMR",
    description: "View audit log details",
}

interface AuditLogDetailsPageProps {
    params: {
        id: string
    }
}

export default function AuditLogDetailsPage({ params }: AuditLogDetailsPageProps) {
    return (
        <RequireRole roles={["Admin"]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Log Details</h1>
                    <p className="text-muted-foreground">Detailed information about system activity</p>
                </div>
                <AuditLogDetails logId={params.id} />
            </div>
        </RequireRole>
    )
}
