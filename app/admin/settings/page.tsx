"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        siteName: "Educational Feedback System",
        siteDescription: "A comprehensive system for educational feedback and student management",
        enableRegistration: true,
        enableFeedback: true,
        enableAI: true,
        welcomeMessage: "Welcome to the Educational Feedback System. This platform helps students, faculty, and administrators manage feedback and improve educational outcomes.",
        contactEmail: "",
        maxUploadSize: "5",
    })

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/")
            return
        }

        fetchSettings()
    }, [user, router])

    const fetchSettings = async () => {
        setLoading(true)

        // In a real application, you would fetch settings from the database
        // For now, we'll just simulate a delay
        setTimeout(() => {
            // If we had actual settings, we would set them here
            setSettings({
                ...settings,
                contactEmail: user?.email || "",
            })
            setLoading(false)
        }, 500)
    }

    const handleSaveSettings = async () => {
        setSaving(true)

        // In a real application, you would save settings to the database
        // For now, we'll just simulate a delay
        setTimeout(() => {
            toast({
                title: "Settings saved",
                description: "Your settings have been saved successfully",
            })
            setSaving(false)
        }, 1000)
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage system settings and configurations</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Manage basic system settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                                <Textarea
                                    id="welcomeMessage"
                                    value={settings.welcomeMessage}
                                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Settings</CardTitle>
                            <CardDescription>Enable or disable system features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableRegistration">User Registration</Label>
                                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                                </div>
                                <Switch
                                    id="enableRegistration"
                                    checked={settings.enableRegistration}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableFeedback">Feedback System</Label>
                                    <p className="text-sm text-muted-foreground">Allow students to submit feedback</p>
                                </div>
                                <Switch
                                    id="enableFeedback"
                                    checked={settings.enableFeedback}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableFeedback: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enableAI">AI Suggestions</Label>
                                    <p className="text-sm text-muted-foreground">Enable AI-powered suggestions</p>
                                </div>
                                <Switch
                                    id="enableAI"
                                    checked={settings.enableAI}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableAI: checked })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure system notifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="py-4 text-center text-muted-foreground">
                                Notification settings will be implemented in a future update.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                            <CardDescription>Configure advanced system settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxUploadSize">Maximum Upload Size (MB)</Label>
                                <Input
                                    id="maxUploadSize"
                                    type="number"
                                    value={settings.maxUploadSize}
                                    onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
