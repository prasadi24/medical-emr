"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createMessage } from "@/app/actions/patient-portal-actions"

const messageSchema = z.object({
    patientId: z.string(),
    staffId: z.string().optional(),
    doctorId: z.string().optional(),
    senderType: z.string(),
    subject: z.string().min(1, "Subject is required").optional(),
    message: z.string().min(1, "Message is required"),
    parentMessageId: z.string().optional(),
})

type MessageFormValues = z.infer<typeof messageSchema>

interface MessageFormProps {
    patientId: string
    doctors?: any[]
    staff?: any[]
    parentMessage?: any
    isReply?: boolean
}

export function MessageForm({ patientId, doctors = [], staff = [], parentMessage, isReply = false }: MessageFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [recipientType, setRecipientType] = useState<string>(
        parentMessage?.sender_type === "patient" ? "staff" : "patient",
    )

    const defaultValues: Partial<MessageFormValues> = {
        patientId,
        senderType: isReply ? (parentMessage?.sender_type === "patient" ? "staff" : "patient") : "patient",
        subject: "",
        message: "",
        parentMessageId: parentMessage?.id,
    }

    const form = useForm<MessageFormValues>({
        resolver: zodResolver(messageSchema),
        defaultValues,
    })

    const onSubmit = async (data: MessageFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append("patientId", data.patientId)
            if (data.staffId) formData.append("staffId", data.staffId)
            if (data.doctorId) formData.append("doctorId", data.doctorId)
            formData.append("senderType", data.senderType)
            if (data.subject) formData.append("subject", data.subject)
            formData.append("message", data.message)
            if (data.parentMessageId) formData.append("parentMessageId", data.parentMessageId)

            await createMessage(formData)
            toast({
                title: "Message sent",
                description: "Your message has been sent successfully.",
            })

            if (isReply && parentMessage) {
                router.push(`/messages/${parentMessage.id}`)
            } else {
                router.push("/messages")
            }
        } catch (error) {
            console.error("Error sending message:", error)
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRecipientTypeChange = (value: string) => {
        setRecipientType(value)
        form.setValue("staffId", undefined)
        form.setValue("doctorId", undefined)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {!isReply && (
                    <>
                        <FormField
                            control={form.control}
                            name="senderType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>I am sending this message as</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sender type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="patient">Patient</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Send To</FormLabel>
                            <div className="flex space-x-4">
                                <Button
                                    type="button"
                                    variant={recipientType === "doctor" ? "default" : "outline"}
                                    onClick={() => handleRecipientTypeChange("doctor")}
                                >
                                    Doctor
                                </Button>
                                <Button
                                    type="button"
                                    variant={recipientType === "staff" ? "default" : "outline"}
                                    onClick={() => handleRecipientTypeChange("staff")}
                                >
                                    Staff
                                </Button>
                            </div>

                            {recipientType === "doctor" && doctors.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="doctorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Doctor</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a doctor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>
                                                            Dr. {doctor.user_profiles.first_name} {doctor.user_profiles.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {recipientType === "staff" && staff.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="staffId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Staff Member</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a staff member" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {staff.map((staffMember) => (
                                                        <SelectItem key={staffMember.id} value={staffMember.id}>
                                                            {staffMember.user_profiles.first_name} {staffMember.user_profiles.last_name} (
                                                            {staffMember.position})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter message subject" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Type your message here" className="min-h-[150px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : isReply ? "Send Reply" : "Send Message"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
