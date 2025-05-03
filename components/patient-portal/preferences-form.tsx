"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { updatePatientPreferences } from "@/app/actions/patient-portal-actions"
import { Button } from "@/components/ui/button"

const preferencesSchema = z.object({
    patientId: z.string(),
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    portalTheme: z.string(),
    languagePreference: z.string(),
    timeZone: z.string(),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
    preferences: any
    patientId: string
}

export function PreferencesForm({ preferences, patientId }: PreferencesFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: Partial<PreferencesFormValues> = {
        patientId,
        emailNotifications: preferences?.notification_preferences?.email ?? true,
        smsNotifications: preferences?.notification_preferences?.sms ?? false,
        pushNotifications: preferences?.notification_preferences?.push ?? false,
        portalTheme: preferences?.portal_theme ?? "light",
        languagePreference: preferences?.language_preference ?? "en",
        timeZone: preferences?.time_zone ?? "UTC",
    }

    const form = useForm<PreferencesFormValues>({
        resolver: zodResolver(preferencesSchema),
        defaultValues,
    })

    const onSubmit = async (data: PreferencesFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append("patientId", data.patientId)
            formData.append("emailNotifications", data.emailNotifications ? "on" : "off")
            formData.append("smsNotifications", data.smsNotifications ? "on" : "off")
            formData.append("pushNotifications", data.pushNotifications ? "on" : "off")
            formData.append("portalTheme", data.portalTheme)
            formData.append("languagePreference", data.languagePreference)
            formData.append("timeZone", data.timeZone)

            await updatePatientPreferences(formData)
            toast({
                title: "Preferences updated",
                description: "Your preferences have been updated successfully.",
            })

            router.refresh()
        } catch (error) {
            console.error("Error updating preferences:", error)
            toast({
                title: "Error",
                description: "Failed to update preferences. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Preferences</h3>

                    <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Email Notifications</FormLabel>
                                    <FormDescription>Receive notifications via email</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="smsNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">SMS Notifications</FormLabel>
                                    <FormDescription>Receive notifications via text message</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pushNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Push Notifications</FormLabel>
                                    <FormDescription>Receive push notifications on your devices</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Portal Preferences</h3>

                    <FormField
                        control={form.control}
                        name="portalTheme"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Theme</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="languagePreference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeZone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time Zone</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select time zone" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
