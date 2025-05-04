import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvoiceById } from "@/app/actions/billing-actions"
import { RequireRole } from "@/components/auth/require-role"
import { InvoiceDetail } from "@/components/billing/invoice-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    try {
        const invoice = await getInvoiceById(params.id)

        if (!invoice) {
            notFound()
        }

        return (
            <RequireRole roles={["Admin", "Billing Staff", "Doctor", "Nurse"]} fallback={<div>Access denied</div>}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/billing/invoices">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Invoice #{invoice.invoice_number}</h1>
                        </div>
                    </div>

                    <InvoiceDetail invoice={invoice} />
                </div>
            </RequireRole>
        )
    } catch (error) {
        console.error("Error fetching invoice:", error)
        notFound()
    }
}
