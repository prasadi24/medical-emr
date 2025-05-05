import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BrainCircuit, FileText, Plus, Copy, Pencil } from "lucide-react"

export const metadata: Metadata = {
    title: "AI Prompts | Medical EMR",
    description: "Manage AI prompt templates and system prompts",
}

export default function AIPromptsPage() {
    // Mock data for prompt templates
    const promptTemplates = [
        {
            id: "prompt-1",
            name: "Clinical Insights",
            description: "Generate insights from clinical notes",
            category: "medical_records",
            prompt: `Analyze the following clinical notes and provide:
1. Key findings summary
2. Potential diagnoses to consider
3. Suggested follow-up actions

Clinical Notes:
{{clinical_notes}}`,
            variables: ["clinical_notes"],
            usageCount: 1245,
        },
        {
            id: "prompt-2",
            name: "Treatment Plan",
            description: "Generate treatment plan suggestions",
            category: "treatment",
            prompt: `Generate evidence-based treatment suggestions for the following:

Diagnosis: {{diagnosis}}

Patient Information:
- Age: {{patient_age}}
- Gender: {{patient_gender}}
- Allergies: {{patient_allergies}}
- Active Conditions: {{patient_conditions}}
- Current Medications: {{patient_medications}}

Provide:
1. First-line treatments (medications, dosage, duration)
2. Alternative treatments
3. Non-pharmacological interventions
4. Follow-up recommendations
5. Patient education points`,
            variables: ["diagnosis", "patient_age", "patient_gender", "patient_allergies", "patient_conditions", "patient_medications"],
            usageCount: 876,
        },
        {
            id: "prompt-3",
            name: "Progress Note",
            description: "Generate a progress note from clinical information",
            category: "documentation",
            prompt: `Generate a comprehensive progress note from the following clinical information:

{{clinical_information}}

Include:
- Subjective (patient's chief complaint, history)
- Objective (physical examination findings, vital signs, test results)
- Assessment (diagnosis, clinical impression)
- Plan (treatment plan, medications, follow-up)`,
            variables: ["clinical_information"],
            usageCount: 2134,
        },
    ]

    // Mock data for system prompts
    const systemPrompts = [
        {
            id: "system-1",
            name: "Clinical Decision Support",
            description: "System prompt for clinical decision support features",
            prompt: "You are a clinical decision support system. Analyze the clinical data and provide evidence-based medical insights. Focus on accuracy and relevance. Avoid making definitive diagnoses, but suggest possibilities based on the information provided. Always recommend consulting with a healthcare professional for final decisions.",
            models: ["GPT-4o", "MedLLaMA"],
            features: ["clinical_insights", "diagnosis_suggestions"],
        },
        {
            id: "system-2",
            name: "Medical Documentation",
            description: "System prompt for documentation generation",
            prompt: "You are a medical documentation assistant. Generate professional, accurate clinical documentation following standard formats. Use appropriate medical terminology. Be concise but comprehensive. Include all relevant information from the provided context. Format the output in a structured, readable manner suitable for medical records.",
            models: ["GPT-4o"],
            features: ["progress_notes", "discharge_summaries", "consultation_reports"],
        },
        {
            id: "system-3",
            name: "Patient Communication",
            description: "System prompt for patient-facing features",
            prompt: "You are a patient-facing medical assistant. Provide clear, accurate health information in simple, non-technical language. Avoid medical jargon when possible. Be empathetic and supportive. Do not provide specific medical advice or diagnoses. For serious concerns, always recommend consulting with a healthcare professional. For medication questions, remind that a doctor should be consulted.",
            models: ["GPT-4o", "Claude 3 Opus"],
            features: ["patient_chat", "education_materials"],
        },
    ]

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Prompts</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage AI prompt templates and system prompts
                    </p>
                </div>
                <Button className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Create New Prompt</span>
                </Button>
            </div>

            <Tabs defaultValue="templates" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
                    <TabsTrigger value="system">System Prompts</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {promptTemplates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                <span>{template.name}</span>
                                            </CardTitle>
                                            <CardDescription>{template.description}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">Category: <span className="font-medium">{template.category}</span></div>
                                            <div className="text-sm text-muted-foreground">Usage: <span className="font-medium">{template.usageCount.toLocaleString()}</span></div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Prompt Template</p>
                                            <div className="bg-slate-50 p-3 rounded-md text-xs font-mono whitespace-pre-wrap">
                                                {template.prompt}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Variables</p>
                                            <div className="flex flex-wrap gap-1">
                                                {template.variables.map((variable) => (
                                                    <span key={variable} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                        {variable}
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

                <TabsContent value="system" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {systemPrompts.map((prompt) => (
                            <Card key={prompt.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <BrainCircuit className="h-5 w-5" />
                                                <span>{prompt.name}</span>
                                            </CardTitle>
                                            <CardDescription>{prompt.description}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">System Prompt</p>
                                            <div className="bg-slate-50 p-3 rounded-md text-xs font-mono whitespace-pre-wrap">
                                                {prompt.prompt}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Assigned Models</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {prompt.models.map((model) => (
                                                        <span key={model} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            {model}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Used in Features</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {prompt.features.map((feature) => (
                                                        <span key={feature} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Prompt Template</CardTitle>
                            <CardDescription>Create a new prompt template for AI features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input placeholder="Enter prompt template name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                                            <option value="medical_records">Medical Records</option>
                                            <option value="treatment">Treatment</option>
                                            <option value="documentation">Documentation</option>
                                            <option value="patient">Patient Communication</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input placeholder="Enter a brief description of this prompt template" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prompt Template</label>
                                    <Textarea
                                        placeholder="Enter your prompt template. Use {{variable_name}} for variables."
                                        rows={10}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">\
                                        Use double curly braces for variables, e.g., {{ '{{\'}}patient_name{{\'}}\'}}
                  </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Variables (comma-separated)</label>
                                    <Input placeholder="e.g., patient_name, diagnosis, symptoms" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign to Features</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="feature-1" className="rounded border-gray-300" />
                                            <label htmlFor="feature-1" className="text-sm">Clinical Insights</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="feature-2" className="rounded border-gray-300" />
                                            <label htmlFor="feature-2" className="text-sm">Treatment Suggestions</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="feature-3" className="rounded border-gray-300" />
                                            <label htmlFor="feature-3" className="text-sm">Documentation</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="feature-4" className="rounded border-gray-300" />
                                            <label htmlFor="feature-4" className="text-sm">Patient Chat</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Create Template</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
