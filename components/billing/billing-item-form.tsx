"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createBillingItem, updateBillingItem } from "@/app/actions/billing-actions"

const billingItemSchema = z.object({
    code: z.string().min(2, "Code must be at least 2 characters"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    defaultPrice: z.coerce.number().min(0, "Price must be a positive number"),
    isActive: z.boolean().default(true),
})

type BillingItemFormValues = z.infer<typeof billingItemSchema>

interface BillingItemFormProps {
    billingItem?: any
    categories?: string[]
}

export function BillingItemForm({ billingItem, categories = [] }: BillingItemFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // If no categories are provided, use these default ones
    const defaultCategories = [
        "Office Visit",
        "Laboratory",
        "Procedure",
        "Medication",
        "Supplies",
        "Consultation",
        "Imaging",
        "Therapy",
        "Surgery",
        "Other",
    ]

    const availableCategories = categories.length > 0 ? categories : defaultCategories

    const defaultValues: Partial<BillingItemFormValues> = {
        code: billingItem?.code || "",
        name: billingItem?.name || "",
        description: billingItem?.description || "",
        category: billingItem?.category || "",
        defaultPrice: billingItem?.default_price || 0,
        isActive: billingItem?.is_active !== false, // Default to true if not specified
    }

    const form = useForm<BillingItemFormValues>({
        resolver: zodResolver(billingItemSchema),
        defaultValues,
    })

    const onSubmit = async (data: BillingItemFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("code", data.code)
            formData.append("name", data.name)
            formData.append("description", data.description || "")
            formData.append("category", data.category)
            formData.append("defaultPrice", data.defaultPrice.toString())
            formData.append("isActive", data.isActive.toString())

            if (billingItem) {
                const result = await updateBillingItem(billingItem.id, formData)
                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Billing item updated successfully",
                    })
                    router.push("/billing/items")
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    })
                }
            } else {
                const result = await createBillingItem(formData)
                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Billing item created successfully",
                    })
                    router.push("/billing/items")
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    })
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
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
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter billing code" {...field} />
                                </FormControl>
                                <FormDescription>A unique code for this billing item (e.g., OV-STD, LAB-CBC)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter item name" {...field} />
                                </FormControl>
                                <FormDescription>The name of the service or item</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The category this item belongs to</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="defaultPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Default Price</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormDescription>The standard price for this item</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter a description"
                                        className="min-h-[100px]"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormDescription>A detailed description of the service or item</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                    <FormDescription>
                                        Inactive items won't appear in dropdown menus when creating invoices
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/billing/items")} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : billingItem ? "Update Item" : "Create Item"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
