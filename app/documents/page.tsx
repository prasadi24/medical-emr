import { getDocuments } from "@/app/actions/document-actions"
import { DocumentsList } from "@/components/documents/documents-list"
import { RequireRole } from "@/components/auth/require-role"

export default async function DocumentsPage() {
    const { documents } = await getDocuments({})

    return (
        <RequireRole roles={["Admin", "Doctor", "Nurse", "Medical Records"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">View and manage all patient documents</p>
                </div>

                <DocumentsList documents={documents} showPatientName={true} />
            </div>
        </RequireRole>
    )
}
