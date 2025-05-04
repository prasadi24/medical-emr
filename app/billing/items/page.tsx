import { getBillingItems } from "@/app/actions/billing-actions"
import { RequireRole } from "@/components/auth/require-role"
import { BillingItemsList } from "@/components/billing/billing-items-list"

export default async function BillingItemsPage({
    searchParams,
}: {
    searchParams: { page?: string; limit?: string; category?: string; isActive?: string; search?: string }
}) {
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const limit = searchParams.limit ? Number.parseInt(searchParams.limit) : 50
    const category = searchParams.category || undefined
    const isActive = searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined
    const search = searchParams.search || undefined

    const { billingItems } = await getBillingItems({
        page,
        limit,
        category,
        isActive,
        search,
    })

    // Extract unique categories for filtering
    const categories = Array.from(new Set(billingItems.map((item) => item.category))).sort()

    return (
        <RequireRole roles={["Admin", "Billing Staff"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Items</h1>
                    <p className="text-muted-foreground">Manage services, procedures, and products</p>
                </div>

                <BillingItemsList billingItems={billingItems} categories={categories} />
            </div>
        </RequireRole>
    )
}