"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { uploadDocument } from "@/app/actions/document-actions"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const documentSchema = z.object({
    name: z.string().min(1, "Document name is required"),
    documentTypeId: z.string().min(1, "Document type is required"),
    patientId: z.string().min(1, "Patient is required"),
    medicalRecordId: z.string().optional(),
    file: z
        .instanceof(File)
        .refine((file) => file.size > 0, "File is required")
        .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 10MB"),
    tags: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentUploadFormProps {
    documentTypes: any[]
    patientId: string
    medicalRecordId?: string
}

export function DocumentUploadForm({ documentTypes, patientId, medicalRecordId }: DocumentUploadFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const defaultValues: Partial<DocumentFormValues> = {
        name: "",
        documentTypeId: "",
        patientId,
        medicalRecordId: medicalRecordId || undefined,
        tags: "",
    }

    const form = useForm<DocumentFormValues>({
        resolver: zodResolver(documentSchema),
        defaultValues,
    })

    const onSubmit = async (data: DocumentFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append("name", data.name)
            formData.append("documentTypeId", data.documentTypeId)
            formData.append("patientId", data.patientId)
            if (data.medicalRecordId) {
                formData.append("medicalRecordId", data.medicalRecordId)
            }
            formData.append("file", data.file)
            if (data.tags) {
                formData.append("tags", data.tags)
            }

            await uploadDocument(formData)
            toast({
                title: "Document uploaded",
                description: "The document has been uploaded successfully.",
            })

            if (medicalRecordId) {
                router.push(`/medical-records/${medicalRecordId}`)
            } else {
                router.push(`/patients/${patientId}`)
            }
        } catch (error) {
            console.error("Error uploading document:", error)
            toast({
                title: "Error",
                description: "Failed to upload document. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            form.setValue("file", file)

            // Auto-fill name if empty
            if (!form.getValues("name")) {
                // Remove extension from filename
                const fileName = file.name.replace(/\.[^/.]+$/, "")
                form.setValue("name", fileName)
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter document name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="documentTypeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {documentTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
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
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>File</FormLabel>
                            <FormControl>
                                <Input type="file" {...fieldProps} onChange={handleFileChange} />
                            </FormControl>
                            <FormDescription>Maximum file size: 10MB</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter tags separated by commas" {...field} />
                            </FormControl>
                            <FormDescription>
                                Optional: Add tags to help organize documents (e.g., "lab, results, blood work")
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Uploading..." : "Upload Document"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
