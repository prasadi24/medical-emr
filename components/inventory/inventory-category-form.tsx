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
import { createInventoryCategory, updateInventoryCategory } from "@/app/actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    parentCategoryId: z.string().optional(),
})

interface InventoryCategoryFormProps {
    category?: any
    categories?: any[]
}

export function InventoryCategoryForm({ category, categories = [] }: InventoryCategoryFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: category?.id || "",
            name: category?.name || "",
            description: category?.description || "",
            parentCategoryId: category?.parent_category_id || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            const formData = new FormData()

            if (category?.id) {
                formData.append("id", category.id)
            }

            formData.append("name", values.name)
            formData.append("description", values.description || "")
            if (values.parentCategoryId) {
                formData.append("parentCategoryId", values.parentCategoryId)
            }

            if (category?.id) {
                await updateInventoryCategory(formData)
            } else {
                await createInventoryCategory(formData)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save category",
                variant: "destructive",
            })
            setIsSubmitting(false)
        }
    }

    // Filter out the current category and its children from parent options
    const parentOptions = categories.filter((c) => c.id !== category?.id)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Category name" {...field} />
                            </FormControl>
                            <FormDescription>The name of the inventory category.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Category description" {...field} />
                            </FormControl>
                            <FormDescription>A brief description of the category.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="parentCategoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent category (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {parentOptions.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Optional parent category.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
                </Button>
            </form>
        </Form>
    )
}
