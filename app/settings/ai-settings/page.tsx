"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, Settings, Shield, Sparkles, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AISettingsPage() {
    const { toast } = useToast()
    const [saving, setSaving] = useState(false)

    // AI feature settings
    const [settings, setSettings] = useState({
        // Clinical features
        clinicalInsightsEnabled: true,
        diagnosticSuggestionsEnabled: true,
        treatmentSuggestionsEnabled: true,
        riskAssessmentEnabled: true,

        // Documentation features
        autoDocumentationEnabled: true,
        structuredDataExtractionEnabled: true,
        medicalSummarizationEnabled: true,

        // Patient engagement
        patientChatbotEnabled: true,

        // Model settings
        preferredModel: "gpt-4o",
        temperatureClinical: 0.3,
        temperatureDocumentation: 0.4,

        // Privacy & compliance
        patientDataMinimization: true,
        auditLoggingEnabled: true,
        humanReviewRequired: true,
    })

    const handleSaveSettings = async () => {
        setSaving(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
            title: "Settings Saved",
            description: "Your AI settings have been updated successfully.",
        })

        setSaving(false)
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure AI features and behavior across your medical practice</p>
                </div>
                <Button onClick={handleSaveSettings} disabled={saving} className="gap-1">
                    {saving ? "Saving..." : "Save Settings"}
                    <Save className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="features" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="features">AI Features</TabsTrigger>
                    <TabsTrigger value="models">Models & Parameters</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy & Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5" />
                                <span>Clinical AI Features</span>
                            </CardTitle>
                            <CardDescription>Configure AI-powered clinical decision support features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Clinical Insights</div>
                                    <div className="text-sm text-muted-foreground">AI-generated insights from medical records</div>
                                </div>
                                <Switch
                                    checked={settings.clinicalInsightsEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, clinicalInsightsEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Diagnostic Suggestions</div>
                                    <div className="text-sm text-muted-foreground">
                                        AI-powered diagnostic suggestions based on symptoms
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.diagnosticSuggestionsEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, diagnosticSuggestionsEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Treatment Suggestions</div>
                                    <div className="text-sm text-muted-foreground">AI-generated treatment plans based on diagnosis</div>
                                </div>
                                <Switch
                                    checked={settings.treatmentSuggestionsEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, treatmentSuggestionsEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Risk Assessment</div>
                                    <div className="text-sm text-muted-foreground">AI-powered patient risk stratification</div>
                                </div>
                                <Switch
                                    checked={settings.riskAssessmentEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, riskAssessmentEnabled: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Documentation Features</span>
                            </CardTitle>
                            <CardDescription>Configure AI-powered documentation and data extraction</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Auto-Documentation</div>
                                    <div className="text-sm text-muted-foreground">AI-generated clinical documentation</div>
                                </div>
                                <Switch
                                    checked={settings.autoDocumentationEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, autoDocumentationEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Structured Data Extraction</div>
                                    <div className="text-sm text-muted-foreground">Extract structured data from clinical notes</div>
                                </div>
                                <Switch
                                    checked={settings.structuredDataExtractionEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, structuredDataExtractionEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Medical Summarization</div>
                                    <div className="text-sm text-muted-foreground">AI-generated summaries of medical records</div>
                                </div>
                                <Switch
                                    checked={settings.medicalSummarizationEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, medicalSummarizationEnabled: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Patient Engagement</span>
                            </CardTitle>
                            <CardDescription>Configure AI-powered patient engagement features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Patient Chatbot</div>
                                    <div className="text-sm text-muted-foreground">AI-powered chatbot for patient questions</div>
                                </div>
                                <Switch
                                    checked={settings.patientChatbotEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, patientChatbotEnabled: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="models" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                <span>Model Configuration</span>
                            </CardTitle>
                            <CardDescription>Configure AI model settings and parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Preferred AI Model</label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                    value={settings.preferredModel}
                                    onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
                                >
                                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                                    <option value="claude-3-opus">Claude 3 Opus (Alternative)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    The default model used for AI features across the platform
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Clinical Temperature: {settings.temperatureClinical}</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">0.1</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={settings.temperatureClinical}
                                        onChange={(e) =>
                                            setSettings({ ...settings, temperatureClinical: Number.parseFloat(e.target.value) })
                                        }
                                        className="flex-1"
                                    />
                                    <span className="text-xs">1.0</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Lower values produce more consistent, conservative clinical outputs
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Documentation Temperature: {settings.temperatureDocumentation}
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">0.1</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={settings.temperatureDocumentation}
                                        onChange={(e) =>
                                            setSettings({ ...settings, temperatureDocumentation: Number.parseFloat(e.target.value) })
                                        }
                                        className="flex-1"
                                    />
                                    <span className="text-xs">1.0</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Controls creativity in documentation generation</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                <span>Privacy & Compliance</span>
                            </CardTitle>
                            <CardDescription>Configure privacy and compliance settings for AI features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Patient Data Minimization</div>
                                    <div className="text-sm text-muted-foreground">
                                        Minimize patient identifiable information in AI prompts
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.patientDataMinimization}
                                    onCheckedChange={(checked) => setSettings({ ...settings, patientDataMinimization: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">AI Usage Audit Logging</div>
                                    <div className="text-sm text-muted-foreground">
                                        Log all AI interactions for compliance and auditing
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.auditLoggingEnabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, auditLoggingEnabled: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Human Review Requirement</div>
                                    <div className="text-sm text-muted-foreground">
                                        Require human review of AI-generated content before finalization
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.humanReviewRequired}
                                    onCheckedChange={(checked) => setSettings({ ...settings, humanReviewRequired: checked })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-amber-50 text-amber-800 text-sm">
                            <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    Ensure your AI usage complies with all applicable healthcare regulations including HIPAA, GDPR, and
                                    other privacy laws. Always review AI-generated content before using it for clinical decisions.
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
