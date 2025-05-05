import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BrainCircuit, Settings, Sparkles, BarChart } from "lucide-react"

export const metadata: Metadata = {
    title: "AI Models | Medical EMR",
    description: "Manage AI models and configurations",
}

export default function AIModelsPage() {
    // Mock data for AI models
    const models = [
        {
            id: "gpt-4o",
            name: "GPT-4o",
            provider: "OpenAI",
            type: "General Purpose",
            status: "active",
            lastUpdated: "2023-05-15",
            usageCount: 2345,
            averageLatency: 1.2,
            features: ["clinical_insights", "documentation", "patient_chat"],
        },
        {
            id: "med-llama",
            name: "MedLLaMA",
            provider: "Meta",
            type: "Medical Specialized",
            status: "active",
            lastUpdated: "2023-04-22",
            usageCount: 1256,
            averageLatency: 0.9,
            features: ["diagnosis_suggestions", "treatment_plans"],
        },
        {
            id: "claude-3-opus",
            name: "Claude 3 Opus",
            provider: "Anthropic",
            type: "General Purpose",
            status: "inactive",
            lastUpdated: "2023-03-10",
            usageCount: 567,
            averageLatency: 1.5,
            features: [],
        },
    ]

    // Mock data for model configurations
    const configurations = [
        {
            id: "config-1",
            name: "Clinical Insights",
            model: "GPT-4o",
            temperature: 0.3,
            maxTokens: 2000,
            systemPrompt: "You are a clinical decision support system...",
            features: ["medical_record_insights", "diagnosis_suggestions"],
        },
        {
            id: "config-2",
            name: "Documentation Generation",
            model: "GPT-4o",
            temperature: 0.4,
            maxTokens: 4000,
            systemPrompt: "You are a medical documentation assistant...",
            features: ["progress_notes", "discharge_summaries", "consultation_reports"],
        },
        {
            id: "config-3",
            name: "Patient Communication",
            model: "MedLLaMA",
            temperature: 0.7,
            maxTokens: 1500,
            systemPrompt: "You are a patient-facing medical assistant...",
            features: ["patient_chat", "education_materials"],
        },
    ]

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
                        {models.map((model) => (
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
                                                    model.features.map((feature) => (
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
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="configurations" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {configurations.map((config) => (
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
                                                <p className="font-medium">{config.maxTokens.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Features</p>
                                                <p className="font-medium">{config.features.length}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">System Prompt</p>
                                            <div className="bg-slate-50 p-3 rounded-md text-xs font-mono">
                                                {config.systemPrompt.substring(0, 100)}...
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Assigned Features</p>
                                            <div className="flex flex-wrap gap-1">
                                                {config.features.map((feature) => (
                                                    <span key={feature} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
