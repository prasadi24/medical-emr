"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BrainCircuit, Stethoscope, ClipboardList } from "lucide-react"
import { generateAIInsightsForMedicalRecord, generateAIDocumentation } from "@/app/actions/ai-medical-record-actions"
import { useToast } from "@/hooks/use-toast"

type MedicalRecordInsightsProps = {
    recordId: string
    patientId: string
    existingInsights?: string
    existingTreatmentSuggestions?: string
}

export default function MedicalRecordInsights({
    recordId,
    patientId,
    existingInsights,
    existingTreatmentSuggestions,
}: MedicalRecordInsightsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [documentLoading, setDocumentLoading] = useState(false)
    const [documentType, setDocumentType] = useState<
        "progress_note" | "discharge_summary" | "consultation" | "procedure_note"
    >("progress_note")
    const [insights, setInsights] = useState<string | null>(existingInsights || null)
    const [treatmentSuggestions, setTreatmentSuggestions] = useState<string | null>(existingTreatmentSuggestions || null)

    const handleGenerateInsights = async () => {
        setLoading(true)
        try {
            const result = await generateAIInsightsForMedicalRecord(recordId)

            if (result.success && result.data) {
                setInsights(result.data.insights || null)
                if (result.data.treatmentSuggestions) {
                    setTreatmentSuggestions(result.data.treatmentSuggestions)
                }

                toast({
                    title: "AI Analysis Complete",
                    description: "Medical record analyzed successfully.",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to generate AI insights",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error generating insights:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateDocument = async () => {
        setDocumentLoading(true)
        try {
            const result = await generateAIDocumentation(recordId, documentType)

            if (result.success) {
                toast({
                    title: "Document Generated",
                    description: "Medical documentation created successfully.",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to generate document",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error generating document:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setDocumentLoading(false)
        }
    }

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    <span>AI Clinical Assistant</span>
                </CardTitle>
                <CardDescription>Get AI-powered insights and document generation for this medical record</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="insights" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="insights">Clinical Insights</TabsTrigger>
                        <TabsTrigger value="documentation">Generate Documentation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="insights" className="space-y-4 pt-4">
                        {!insights && !treatmentSuggestions ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <BrainCircuit className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No AI insights yet</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
                                    Generate AI insights to help with diagnosis, treatment planning, and clinical decision-making.
                                </p>
                                <Button onClick={handleGenerateInsights} disabled={loading} className="gap-1">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Generate Clinical Insights
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {insights && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Stethoscope className="h-5 w-5" />
                                            Clinical Insights
                                        </h3>
                                        <div className="rounded-md bg-slate-50 p-4 text-sm whitespace-pre-line">{insights}</div>
                                    </div>
                                )}

                                {treatmentSuggestions && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5" />
                                            Treatment Suggestions
                                        </h3>
                                        <div className="rounded-md bg-slate-50 p-4 text-sm whitespace-pre-line">{treatmentSuggestions}</div>
                                    </div>
                                )}

                                <Button onClick={handleGenerateInsights} disabled={loading} variant="outline" className="gap-1">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Regenerate Insights
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="documentation" className="pt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Document Type</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value as any)}
                                        disabled={documentLoading}
                                    >
                                        <option value="progress_note">Progress Note</option>
                                        <option value="discharge_summary">Discharge Summary</option>
                                        <option value="consultation">Consultation Report</option>
                                        <option value="procedure_note">Procedure Note</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button onClick={handleGenerateDocument} disabled={documentLoading} className="gap-1">
                                    {documentLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Generate Document
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground mt-4">
                                <p>
                                    The generated document will be saved to the patient&apos;s records and can be accessed from the
                                    Documents tab.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
