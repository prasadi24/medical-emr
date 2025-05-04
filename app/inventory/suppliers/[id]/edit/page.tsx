import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getInventorySupplier } from "@/app/actions/inventory-actions"
import { InventorySupplierForm } from "@/components/inventory/inventory-supplier-form"

export const metadata: Metadata = {
    title: "Edit Supplier",
    description: "Edit an existing inventory supplier.",
}

interface EditInventorySupplierPageProps {
    params: {
        id: string
    }
}

export default async function EditInventorySupplierPage({ params }: EditInventorySupplierPageProps) {
    const supplier = await getInventorySupplier(params.id)

    if (!supplier) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Supplier</h1>
            <div className="max-w-2xl mx-auto">
                <InventorySupplierForm supplier={supplier} />
            </div>
        </div>
    )
}
