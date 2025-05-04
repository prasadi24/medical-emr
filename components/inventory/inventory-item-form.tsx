"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createInventoryItem, updateInventoryItem } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    sku: z.string().min(1, {
        message: "SKU is required.",
    }),
    description: z.string().optional(),
    categoryId: z.string().min(1, {
        message: "Category is required.",
    }),
    unitOfMeasure: z.string().min(1, {
        message: "Unit of measure is required.",
    }),
    minimumStockLevel: z.coerce.number().int().min(0),
    reorderLevel: z.coerce.number().int().min(0),
    reorderQuantity: z.coerce.number().int().min(0),
    location: z.string().optional(),
    isMedication: z.boolean().default(false),
    requiresPrescription: z.boolean().default(false),
    isActive: z.boolean().default(true),
})

interface InventoryItemFormProps {
    item?: any
    categories: any[]
    suppliers?: any[] // Added suppliers prop
}

export function InventoryItemForm({ item, categories, suppliers = [] }: InventoryItemFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: item?.id || "",
            name: item?.name || "",
            sku: item?.sku || "",
            description: item?.description || "",
            categoryId: item?.category_id || "",
            unitOfMeasure: item?.unit_of_measure || "",
            minimumStockLevel: item?.minimum_stock_level || 0,
            reorderLevel: item?.reorder_level || 10,
            reorderQuantity: item?.reorder_quantity || 20,
            location: item?.location || "",
            isMedication: item?.is_medication || false,
            requiresPrescription: item?.requires_prescription || false,
            isActive: item?.is_active !== false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            const formData = new FormData()

            if (item?.id) {
                formData.append("id", item.id)
            }

            formData.append("name", values.name)
            formData.append("sku", values.sku)
            formData.append("description", values.description || "")
            formData.append("categoryId", values.categoryId)
            formData.append("unitOfMeasure", values.unitOfMeasure)
            formData.append("minimumStockLevel", values.minimumStockLevel.toString())
            formData.append("reorderLevel", values.reorderLevel.toString())
            formData.append("reorderQuantity", values.reorderQuantity.toString())
            formData.append("location", values.location || "")
            formData.append("isMedication", values.isMedication ? "on" : "off")
            formData.append("requiresPrescription", values.requiresPrescription ? "on" : "off")
            formData.append("isActive", values.isActive ? "on" : "off")

            if (item?.id) {
                await updateInventoryItem(formData)
            } else {
                await createInventoryItem(formData)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save item",
                variant: "destructive",
            })
            setIsSubmitting(false)
        }
    }

    const unitOptions = [
        "Each",
        "Box",
        "Pack",
        "Bottle",
        "Vial",
        "Ampule",
        "Tablet",
        "Capsule",
        "ml",
        "L",
        "g",
        "kg",
        "mg",
        "cm",
        "m",
    ]

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Item name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="Stock keeping unit" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
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
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
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
                        name="unitOfMeasure"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit of Measure</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {unitOptions.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
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
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Storage Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Storage location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="minimumStockLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Stock Level</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormDescription>Minimum quantity to maintain in stock</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reorderLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reorder Level</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormDescription>Quantity at which to reorder</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reorderQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reorder Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormDescription>Quantity to order when reordering</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="isMedication"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Is Medication</FormLabel>
                                    <FormDescription>Check if this item is a medication</FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requiresPrescription"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={!form.watch("isMedication")}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Requires Prescription</FormLabel>
                                    <FormDescription>Check if this medication requires a prescription</FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Active</FormLabel>
                                    <FormDescription>Uncheck to disable this item</FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
                </Button>
            </form>
        </Form>
    )
}
