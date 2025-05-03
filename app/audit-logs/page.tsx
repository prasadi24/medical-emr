import type { Metadata } from "next"
import { AuditLogsList } from "@/components/audit-logs/audit-logs-list"
import { RequireRole } from "@/components/auth/require-role"

export const metadata: Metadata = {
    title: "Audit Logs | Medical EMR",
    description: "View system audit logs",
}

export default function AuditLogsPage() {
    return (
        <RequireRole roles={["Admin"]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">View and search system activity logs</p>
                </div>
                <AuditLogsList />
            </div>
        </RequireRole>
    )
}
