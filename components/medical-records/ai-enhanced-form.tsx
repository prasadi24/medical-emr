"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { AIService } from "@/lib/ai/ai-service"
import { useToast } from "@/hooks/use-toast"

type AIEnhancedFormProps = {
    onAIGenerated: (field: string, content: string) => void
    patientData?: any
}

export default function AIEnhancedForm({ onAIGenerated, patientData }: AIEnhancedFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [field, setField] = useState<"chief_complaint" | "diagnosis" | "treatment_plan" | "notes">("notes")
    const [prompt, setPrompt] = useState("")

    const handleGenerateContent = async () => {
        if (!prompt.trim()) {
            toast({
                title: "Empty prompt",
                description: "Please enter a prompt to generate content",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            // Prepare context from patient data if available
            let context = ""
            if (patientData) {
                context = `
        Patient: ${patientData.first_name || ""} ${patientData.last_name || ""}
        Age: ${patientData.age || "Unknown"}
        Gender: ${patientData.gender || "Unknown"}
        Medical History: ${patientData.medical_history ? JSON.stringify(patientData.medical_history) : "None"}
        `
            }

            // Generate content based on field
            let systemPrompt = ""
            let userPrompt = ""

            switch (field) {
                case "chief_complaint":
                    systemPrompt = "You are a medical scribe. Format the chief complaint concisely and professionally."
                    userPrompt = `Based on this information: "${prompt}", write a professional chief complaint.${context ? `\n\nPatient context: ${context}` : ""
                        }`
                    break
                case "diagnosis":
                    systemPrompt =
                        "You are a medical documentation assistant. Format the diagnosis in standard medical terminology."
                    userPrompt = `Based on these findings: "${prompt}", write a formal medical diagnosis.${context ? `\n\nPatient context: ${context}` : ""
                        }`
                    break
                case "treatment_plan":
                    systemPrompt = "You are a treatment plan assistant. Create comprehensive, evidence-based treatment plans."
                    userPrompt = `Create a treatment plan for: "${prompt}".${context ? `\n\nPatient context: ${context}` : ""}`
                    break
                case "notes":
                    systemPrompt = "You are a medical scribe. Format clinical notes in a clear, professional manner."
                    userPrompt = `Convert these notes into professional clinical documentation: "${prompt}".${context ? `\n\nPatient context: ${context}` : ""
                        }`
                    break
            }

            const result = await AIService.generateText({
                prompt: userPrompt,
                system: systemPrompt,
                temperature: 0.4,
            })

            if (result.text) {
                // Pass the generated content to the parent component
                onAIGenerated(field, result.text)

                toast({
                    title: "Content Generated",
                    description: `AI-generated content for ${field.replace("_", " ")} has been added.`,
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to generate content. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error generating content:", error)
            toast({
                title: "Error",
                description: "Failed to generate content. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h3 className="font-medium">AI-Assisted Documentation</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Field to Generate</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field}
                                onChange={(e) => setField(e.target.value as any)}
                                disabled={loading}
                            >
                                <option value="chief_complaint">Chief Complaint</option>
                                <option value="diagnosis">Diagnosis</option>
                                <option value="treatment_plan">Treatment Plan</option>
                                <option value="notes">Clinical Notes</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Input</label>
                        <Textarea
                            placeholder={
                                field === "chief_complaint"
                                    ? "Enter patient's complaints or symptoms..."
                                    : field === "diagnosis"
                                        ? "Enter diagnostic findings or suspected conditions..."
                                        : field === "treatment_plan"
                                            ? "Enter treatment goals or required interventions..."
                                            : "Enter your clinical observations or notes..."
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            disabled={loading}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2 text-xs text-amber-800">
                            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>AI-generated content should always be reviewed for accuracy before saving.</span>
                        </div>

                        <Button onClick={handleGenerateContent} disabled={loading || !prompt.trim()} className="gap-1">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Generate
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
