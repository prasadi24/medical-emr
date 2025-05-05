import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, Settings, BarChart } from 'lucide-react'
import AIModelsManager from "@/components/admin/ai-models-manager"
import AIUsageStats from "@/components/admin/ai-usage-stats"

export const metadata = {
    title: "AI Settings | Medical EMR",
    description: "Manage AI models and view usage statistics",
}

export default function AISettingsPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AI System Settings</h1>
            </div>

            <Tabs defaultValue="models" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="models" className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        <span>AI Models</span>
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        <span>Usage Statistics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                <span>AI Models Configuration</span>
                            </CardTitle>
                            <CardDescription>
                                Configure AI models used throughout the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<div>Loading AI models...</div>}>
                                <AIModelsManager />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5" />
                                <span>AI Usage Statistics</span>
                            </CardTitle>
                            <CardDescription>
                                Monitor AI feature usage across the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<div>Loading usage statistics...</div>}>
                                <AIUsageStats />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
