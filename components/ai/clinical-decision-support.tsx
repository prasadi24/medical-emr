"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BrainCircuit, Stethoscope, Pill, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AIFeedback from "@/components/ai/ai-feedback"

type ClinicalDecisionSupportProps = {
    patientId: string
    medicalRecordId: string
    diagnosis?: string
    userId: string
}

export default function ClinicalDecisionSupport({
    patientId,
    medicalRecordId,
    diagnosis,
    userId,
}: ClinicalDecisionSupportProps) {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("guidelines")
    const [loading, setLoading] = useState(false)
    const [aiLogId, setAiLogId] = useState<string | null>(null)
    const [guidelinesData, setGuidelinesData] = useState<any | null>(null)
    const [interactionsData, setInteractionsData] = useState<any | null>(null)
    const [evidenceData, setEvidenceData] = useState<any | null>(null)

    const handleGenerateSupport = async () => {
        if (!diagnosis) {
            toast({
                title: "No diagnosis",
                description: "Please enter a diagnosis to get clinical decision support",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            // This would be a real API call in production
            // For now, simulate a delay and use mock data
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Mock log ID for feedback
            const mockLogId = `log-${Date.now()}`
            setAiLogId(mockLogId)

            // Mock data based on the active tab
            if (activeTab === "guidelines") {
                setGuidelinesData({
                    diagnosis: diagnosis,
                    guidelines: [
                        {
                            source: "American Heart Association (2023)",
                            recommendations: [
                                "First-line treatment: ACE inhibitors or ARBs",
                                "Consider beta-blockers for patients with reduced ejection fraction",
                                "Lifestyle modifications including sodium restriction and regular physical activity",
                                "Monitor renal function and electrolytes within 1-2 weeks of initiation",
                            ],
                            evidenceLevel: "Class I, Level A",
                        },
                        {
                            source: "European Society of Cardiology (2022)",
                            recommendations: [
                                "Target blood pressure <130/80 mmHg if tolerated",
                                "Combination therapy recommended for most patients",
                                "Diuretics recommended for volume overload",
                                "Regular monitoring of cardiac function",
                            ],
                            evidenceLevel: "Class I, Level B",
                        },
                    ],
                })
            } else if (activeTab === "interactions") {
                setInteractionsData({
                    medications: [
                        {
                            name: "Lisinopril",
                            interactions: [
                                {
                                    with: "Potassium supplements",
                                    severity: "moderate",
                                    effect: "Increased risk of hyperkalemia",
                                    recommendation: "Monitor potassium levels closely",
                                },
                                {
                                    with: "NSAIDs",
                                    severity: "moderate",
                                    effect: "Reduced antihypertensive effect",
                                    recommendation: "Consider alternative pain management",
                                },
                            ],
                        },
                        {
                            name: "Metoprolol",
                            interactions: [
                                {
                                    with: "Verapamil",
                                    severity: "severe",
                                    effect: "Additive cardiac effects, risk of heart block",
                                    recommendation: "Avoid combination if possible",
                                },
                                {
                                    with: "Insulin",
                                    severity: "mild",
                                    effect: "May mask symptoms of hypoglycemia",
                                    recommendation: "Monitor blood glucose more frequently",
                                },
                            ],
                        },
                    ],
                })
            } else if (activeTab === "evidence") {
                setEvidenceData({
                    studies: [
                        {
                            title: "PARADIGM-HF Trial (2014)",
                            findings: "Sacubitril/valsartan reduced cardiovascular mortality by 20% compared to enalapril in patients with heart failure", \
                            participants: 8, 442,
                            url: "#",
                        },
                        {
                            title: "DAPA-HF Trial (2019)",
                            findings: "Dapagliflozin reduced risk of worsening heart failure and cardiovascular death by 26% compared to placebo",
                            participants: 4, 744,
                            url: "#",
                        },
                        {
                            title: "EMPEROR-Reduced Trial (2020)",
                            findings: "Empagliflozin reduced the combined risk of cardiovascular death or hospitalization for heart failure by 25%",
                            participants: 3, 730,
                            url: "#",
                        },
                    ],
                    metaAnalyses: [
                        {
                            title: "Beta-blockers for Heart Failure (2019)",
                            findings: "Meta-analysis of 11 trials showed 34% reduction in all-cause mortality with beta-blocker therapy",
                            studies: 11,
                            participants: 14_638,
                            url: "#",
                        },
                    ],
                })
            }

            toast({
                title: "Support Generated",
                description: `Clinical decision support for ${diagnosis} generated successfully`,
            })
        } catch (error) {
            console.error("Error generating clinical decision support:", error)
            toast({
                title: "Error",
                description: "Failed to generate clinical decision support",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generating clinical decision support...</p>
                </div>
            )
        }

        if (activeTab === "guidelines" && guidelinesData) {
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">
                            Treatment Guidelines for {guidelinesData.diagnosis}
                        </h3>
                        {guidelinesData.guidelines.map((guideline: any, i: number) => (
                            <div key={i} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium">{guideline.source}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                        {guideline.evidenceLevel}
                                    </span>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {guideline.recommendations.map((rec: string, j: number) => (
                                        <li key={j} className="text-sm">
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        if (activeTab === "interactions" && interactionsData) {
            return (
                <div className="space-y-6">
                    {interactionsData.medications.map((med: any, i: number) => (
                        <div key={i} className="bg-amber-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-amber-800 mb-2">{med.name} Interactions</h3>
                            <div className="space-y-3">
                                {med.interactions.map((interaction: any, j: number) => (
                                    <div key={j} className="border-b border-amber-200 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-medium">With: {interaction.with}</h4>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${interaction.severity === "severe"
                                                        ? "bg-red-100 text-red-800"
                                                        : interaction.severity === "moderate"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-1">{interaction.effect}</p>
                                        <p className="text-xs text-amber-800">
                                            <span className="font-medium">Recommendation:</span> {interaction.recommendation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (activeTab === "evidence" && evidenceData) {
            return (
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Key Clinical Trials</h3>
                        <div className="space-y-3">
                            {evidenceData.studies.map((study: any, i: number) => (
                                <div key={i} className="border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                    <h4 className="text-sm font-medium">{study.title}</h4>
                                    <p className="text-sm mb-1">{study.findings}</p>
                                    <p className="text-xs text-muted-foreground">Participants: {study.participants.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Meta-Analyses</h3>
                        <div className="space-y-3">
                            {evidenceData.metaAnalyses.map((meta: any, i: number) => (
                                <div key={i}>
                                    <h4 className="text-sm font-medium">{meta.title}</h4>
                                    <p className="text-sm mb-1">{meta.findings}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {meta.studies} studies, {meta.participants.toLocaleString()} participants
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Clinical Decision Support</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Get evidence-based guidelines, medication interactions, and research evidence to support clinical decisions.
                </p>
                <Button onClick={handleGenerateSupport} disabled={!diagnosis} className="gap-1">
                    <BrainCircuit className="h-4 w-4" />
                    Generate Support for {diagnosis || "Diagnosis"}
                </Button>
                {!diagnosis && (
                    <p className="text-xs text-amber-600 mt-2">Please enter a diagnosis to generate clinical decision support</p>
                )}
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    <span>Clinical Decision Support</span>
                </CardTitle>
                <CardDescription>AI-powered clinical decision support based on current guidelines and evidence</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="guidelines" className="gap-1">
                            <Stethoscope className="h-4 w-4" />
                            <span className="hidden sm:inline">Guidelines</span>
                        </TabsTrigger>
                        <TabsTrigger value="interactions" className="gap-1">
                            <Pill className="h-4 w-4" />
                            <span className="hidden sm:inline">Interactions</span>
                        </TabsTrigger>
                        <TabsTrigger value="evidence" className="gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Evidence</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">{renderContent()}</div>
                </Tabs>

                {(guidelinesData || interactionsData || evidenceData) && aiLogId && (
                    <div className="mt-6">
                        <AIFeedback logId={aiLogId} userId={userId} feature="clinical_decision_support" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
