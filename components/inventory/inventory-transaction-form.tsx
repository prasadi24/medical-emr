"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createInventoryTransaction, updateInventoryTransaction } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    item_id: z.string().min(1, "Item is required"),
    transaction_type: z.enum(["purchase", "usage", "adjustment", "return", "transfer"]),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
    unit_price: z.coerce.number().min(0, "Unit price must be 0 or greater"),
    transaction_date: z.string().min(1, "Transaction date is required"),
    supplier_id: z.string().optional(),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
})

interface InventoryTransactionFormProps {
    items: any[]
    suppliers: any[]
    transaction?: any
    preselectedItemId?: string
}

export function InventoryTransactionForm({
    items,
    suppliers,
    transaction,
    preselectedItemId,
}: InventoryTransactionFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            item_id: transaction?.item_id || preselectedItemId || "",
            transaction_type: transaction?.transaction_type || "purchase",
            quantity: transaction?.quantity || 1,
            unit_price: transaction?.unit_price || 0,
            transaction_date: transaction?.transaction_date
                ? new Date(transaction.transaction_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            supplier_id: transaction?.supplier_id || "",
            reference_number: transaction?.reference_number || "",
            notes: transaction?.notes || "",
        },
    })

    const transactionType = form.watch("transaction_type")

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            if (transaction) {
                await updateInventoryTransaction(transaction.id, values)
                toast({
                    title: "Transaction updated",
                    description: "The inventory transaction has been updated successfully.",
                })
            } else {
                await createInventoryTransaction(values)
                toast({
                    title: "Transaction created",
                    description: "The inventory transaction has been created successfully.",
                })
            }
            router.push("/inventory/transactions")
            router.refresh()
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save transaction",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="item_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an item" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {items.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} ({item.sku})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="transaction_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="purchase">Purchase</SelectItem>
                                        <SelectItem value="usage">Usage</SelectItem>
                                        <SelectItem value="adjustment">Adjustment</SelectItem>
                                        <SelectItem value="return">Return</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormDescription>
                                    {transactionType === "usage" || transactionType === "return"
                                        ? "For usage or returns, enter a positive number (it will be automatically subtracted from inventory)"
                                        : "Enter the quantity to add to inventory"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unit_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormDescription>
                                    {transactionType === "purchase" || transactionType === "return"
                                        ? "Enter the price per unit"
                                        : "Optional for this transaction type"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="transaction_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {(transactionType === "purchase" || transactionType === "return") && (
                        <FormField
                            control={form.control}
                            name="supplier_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a supplier (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="reference_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference Number</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    {transactionType === "purchase"
                                        ? "Invoice or PO number"
                                        : transactionType === "return"
                                            ? "RMA or return reference"
                                            : "Optional reference number"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : transaction ? "Update Transaction" : "Create Transaction"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
