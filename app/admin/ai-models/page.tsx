import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BrainCircuit, Settings, Sparkles, BarChart } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
    title: "AI Models | Medical EMR",
    description: "Manage AI models and configurations",
}

export default async function AIModelsPage() {
    const supabase = createServerSupabaseClient()

    // Get AI models
    const { data: aiModels } = await supabase.from("ai_models").select("*").order("id", { ascending: true })

    // Get AI model configurations
    const { data: modelConfigurations } = await supabase
        .from("ai_model_configurations")
        .select(`
      *,
      ai_models (name, provider)
    `)
        .order("created_at", { ascending: false })
        .limit(10)

    // Process models data
    const processedModels =
        aiModels?.map((model) => ({
            id: model.id,
            name: model.name,
            provider: model.provider,
            type: model.model_type,
            status: model.is_active ? "active" : "inactive",
            lastUpdated: new Date(model.updated_at).toLocaleDateString(),
            usageCount: Math.floor(Math.random() * 3000), // Mock data
            averageLatency: (Math.random() * 2).toFixed(1),
            features: model.config?.features || [],
        })) || []

    // Process configurations data
    const processedConfigurations =
        modelConfigurations?.map((config) => ({
            id: config.id,
            name: config.name,
            model: config.ai_models?.name || "Unknown Model",
            temperature: config.temperature,
            maxTokens: config.max_tokens,
            systemPrompt: "You are a clinical decision support system...", // Mock data
            features: config.features || [],
        })) || []

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
                    <p className="text-muted-foreground mt-1">Manage AI models, configurations, and feature assignments</p>
                </div>
                <Button className="gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Add New Model</span>
                </Button>
            </div>

            <Tabs defaultValue="models" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="models">Models</TabsTrigger>
                    <TabsTrigger value="configurations">Configurations</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {processedModels.length > 0 ? (
                            processedModels.map((model) => (
                                <Card key={model.id} className={model.status === "inactive" ? "opacity-70" : ""}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="flex items-center gap-2">
                                                <BrainCircuit className="h-5 w-5" />
                                                <span>{model.name}</span>
                                            </CardTitle>
                                            <Switch checked={model.status === "active"} />
                                        </div>
                                        <CardDescription>
                                            {model.provider} • {model.type}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Usage</p>
                                                    <p className="font-medium">{model.usageCount.toLocaleString()} requests</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Avg. Latency</p>
                                                    <p className="font-medium">{model.averageLatency}s</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Assigned Features</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {model.features.length > 0 ? (
                                                        model.features.map((feature: string) => (
                                                            <span key={feature} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                                {feature}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No features assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-4">
                                        <Button variant="outline" size="sm">
                                            <Settings className="h-4 w-4 mr-1" />
                                            Configure
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <BarChart className="h-4 w-4 mr-1" />
                                            View Stats
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 text-muted-foreground">No AI models found</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="configurations" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {processedConfigurations.length > 0 ? (
                            processedConfigurations.map((config) => (
                                <Card key={config.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{config.name}</CardTitle>
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                        <CardDescription>Using {config.model} model</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Temperature</p>
                                                    <p className="font-medium">{config.temperature}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Max Tokens</p>
                                                    <p className="font-medium">{config.maxTokens?.toLocaleString() || "Not set"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Features</p>
                                                    <p className="font-medium">{config.features?.length || 0}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">System Prompt</p>
                                                <div className="bg-slate-50 p-3 rounded-md text-xs font-mono">
                                                    {config.systemPrompt?.substring(0, 100)}...
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Assigned Features</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {config.features && config.features.length > 0 ? (
                                                        config.features.map((feature: string) => (
                                                            <span key={feature} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                                {feature}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No features assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">No model configurations found</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5" />
                                <span>Model Performance Comparison</span>
                            </CardTitle>
                            <CardDescription>Compare performance metrics across different AI models</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <BarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Performance comparison chart would appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Response Time</CardTitle>
                                <CardDescription>Average response time by model and feature</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <BarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Response time chart would appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quality Scores</CardTitle>
                                <CardDescription>User-rated quality scores by model</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <BarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Quality score chart would appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
