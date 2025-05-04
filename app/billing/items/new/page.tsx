import { RequireRole } from "@/components/auth/require-role"
import { BillingItemForm } from "@/components/billing/billing-item-form"
import { getBillingItems } from "@/app/actions/billing-actions"

export default async function NewBillingItemPage() {
    // Get existing billing items to extract categories
    const { billingItems } = await getBillingItems()
    const categories = Array.from(new Set(billingItems.map((item) => item.category))).sort()

    return (
        <RequireRole roles={["Admin", "Billing Staff"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Billing Item</h1>
                <BillingItemForm categories={categories} />
            </div>
        </RequireRole>
    )
}