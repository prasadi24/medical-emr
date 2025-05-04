import { getInvoices } from "@/app/actions/billing-actions"
import { RequireRole } from "@/components/auth/require-role"
import { InvoicesList } from "@/components/billing/invoices-list"

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams: {
        page?: string
        limit?: string
        status?: string
        startDate?: string
        endDate?: string
        search?: string
    }
}) {
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const limit = searchParams.limit ? Number.parseInt(searchParams.limit) : 10
    const status = searchParams.status || undefined
    const startDate = searchParams.startDate || undefined
    const endDate = searchParams.endDate || undefined
    const search = searchParams.search || undefined

    const { invoices, totalCount } = await getInvoices({
        page,
        limit,
        status,
        startDate,
        endDate,
        search,
    })

    return (
        <RequireRole roles={["Admin", "Billing Staff", "Doctor", "Nurse"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage patient invoices and payments</p>
                </div>

                <InvoicesList invoices={invoices} totalCount={totalCount} currentPage={page} pageSize={limit} />
            </div>
        </RequireRole>
    )
}
