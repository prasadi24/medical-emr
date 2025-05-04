import { notFound } from "next/navigation"
import { getBillingItemById, getBillingItems } from "@/app/actions/billing-actions"
import { RequireRole } from "@/components/auth/require-role"
import { BillingItemForm } from "@/components/billing/billing-item-form"

export default async function EditBillingItemPage({ params }: { params: { id: string } }) {
    try {
        const billingItem = await getBillingItemById(params.id)

        if (!billingItem) {
            notFound()
        }

        // Get existing billing items to extract categories
        const { billingItems } = await getBillingItems()
        const categories = Array.from(new Set(billingItems.map((item) => item.category))).sort()

        return (
            <RequireRole roles={["Admin", "Billing Staff"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Billing Item</h1>
                    <BillingItemForm billingItem={billingItem} categories={categories} />
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching billing item:", error)
        notFound()
    }
}