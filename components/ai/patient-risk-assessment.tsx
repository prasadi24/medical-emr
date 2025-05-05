"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ActivitySquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RiskType = "readmission" | "chronic" | "preventive" | "medication"
type RiskLevel = "low" | "moderate" | "high" | "very-high"

type RiskResult = {
    level: RiskLevel
    score: number
    factors: string[]
    recommendations: string[]
}

type PatientRiskAssessmentProps = {
    patientId: string
    patientData: any // This would be your patient data from Supabase
}

// Normally this would be a server action, but for this example we'll mock the AI response
const mockGenerateRiskAssessment = async (patientId: string, riskType: RiskType): Promise<RiskResult> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock different responses based on risk type
    switch (riskType) {
        case "readmission":
            return {
                level: "moderate",
                score: 65,
                factors: [
                    "Previous hospital admission within last 6 months",
                    "Multiple chronic conditions",
                    "Moderate adherence to medication regimen",
                ],
                recommendations: [
                    "Schedule follow-up appointment within 7 days of discharge",
                    "Medication reconciliation before discharge",
                    "Coordinate with home health services",
                    "Patient education on warning signs requiring medical attention",
                ],
            }
        case "chronic":
            return {
                level: "high",
                score: 82,
                factors: [
                    "Uncontrolled diabetes (HbA1c > 8.0)",
                    "Hypertension with variable control",
                    "Family history of cardiovascular disease",
                    "Sedentary lifestyle",
                ],
                recommendations: [
                    "Increase frequency of HbA1c monitoring to every 3 months",
                    "Refer to dietitian for nutritional counseling",
                    "Implement home blood pressure monitoring",
                    "Consider cardiology consultation for risk stratification",
                    "Encourage enrollment in diabetes self-management program",
                ],
            }
        case "preventive":
            return {
                level: "low",
                score: 30,
                factors: [
                    "Up to date on most vaccinations",
                    "Regular physical exams",
                    "No significant family history of cancer",
                ],
                recommendations: [
                    "Due for influenza vaccination this season",
                    "Schedule routine colonoscopy (age-appropriate)",
                    "Continue annual physical examinations",
                    "Consider bone density screening at next visit",
                ],
            }
        case "medication":
            return {
                level: "very-high",
                score: 90,
                factors: [
                    "Currently on 5+ medications (polypharmacy)",
                    "Two potentially interacting medications detected",
                    "History of adverse drug reaction",
                    "Renal function decline affecting medication clearance",
                ],
                recommendations: [
                    "Comprehensive medication review by clinical pharmacist",
                    "Consider deprescribing non-essential medications",
                    "Adjust dosing based on current renal function",
                    "Switch to alternative medication with less interaction potential",
                    "Increase monitoring frequency for potential adverse effects",
                ],
            }
        default:
            return {
                level: "low",
                score: 25,
                factors: ["No significant risk factors identified"],
                recommendations: ["Continue routine monitoring"],
            }
    }
}

export default function PatientRiskAssessment({ patientId, patientData }: PatientRiskAssessmentProps) {
    const { toast } = useToast()
    const [activeRiskType, setActiveRiskType] = useState<RiskType>("readmission")
    const [loading, setLoading] = useState(false)
    const [riskResult, setRiskResult] = useState<RiskResult | null>(null)

    const handleGenerateRiskAssessment = async () => {
        setLoading(true)
        try {
            const result = await mockGenerateRiskAssessment(patientId, activeRiskType)
            setRiskResult(result)
        } catch (error) {
            console.error("Error generating risk assessment:", error)
            toast({
                title: "Error",
                description: "Failed to generate risk assessment",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (level: RiskLevel) => {
        switch (level) {
            case "low":
                return "bg-green-100 text-green-800"
            case "moderate":
                return "bg-yellow-100 text-yellow-800"
            case "high":
                return "bg-orange-100 text-orange-800"
            case "very-high":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatRiskType = (type: RiskType) => {
        switch (type) {
            case "readmission":
                return "Readmission Risk"
            case "chronic":
                return "Chronic Disease Progression"
            case "preventive":
                return "Preventive Care Gaps"
            case "medication":
                return "Medication Risk"
            default:
                return type
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>AI Risk Assessment</span>
                </CardTitle>
                <CardDescription>AI-powered risk assessment for various clinical concerns</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {(["readmission", "chronic", "preventive", "medication"] as RiskType[]).map((type) => (
                            <Button
                                key={type}
                                variant={activeRiskType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setActiveRiskType(type)
                                    setRiskResult(null)
                                }}
                            >
                                {formatRiskType(type)}
                            </Button>
                        ))}
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-4">
                            {activeRiskType === "readmission" && "Assess the patient's risk of hospital readmission within 30 days"}
                            {activeRiskType === "chronic" && "Evaluate risk of progression for chronic conditions"}
                            {activeRiskType === "preventive" && "Identify gaps in preventive care and screening"}
                            {activeRiskType === "medication" && "Analyze medication regimen for risks and interactions"}
                        </p>

                        {!riskResult ? (
                            <Button onClick={handleGenerateRiskAssessment} disabled={loading} className="w-full">
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Generate {formatRiskType(activeRiskType)} Assessment
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(riskResult.level)}`}>
                                            {riskResult.level.charAt(0).toUpperCase() + riskResult.level.slice(1)} Risk
                                        </div>
                                        <div className="text-sm font-medium">Score: {riskResult.score}/100</div>
                                    </div>

                                    <ActivitySquare className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {riskResult.factors.map((factor, i) => (
                                            <li key={i} className="text-sm">
                                                {factor}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {riskResult.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm">
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button onClick={handleGenerateRiskAssessment} disabled={loading} variant="outline" size="sm">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Regenerate
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
