"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Search, Loader2, Info, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type DiagnosisSuggesterProps = {
    symptoms: string[]
    onSelectDiagnosis: (diagnosis: string) => void
}

// Mock AI service calls for diagnosis suggestions
const mockGetDiagnosisSuggestions = async (symptoms: string[]) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple mock responses based on symptoms
    const commonCold = {
        name: "Common Cold (Viral URI)",
        probability: 0.85,
        description:
            "A viral infection affecting the upper respiratory tract, characterized by sneezing, congestion, and sore throat.",
        symptoms: ["Nasal congestion", "Sore throat", "Sneezing", "Cough", "Low-grade fever"],
        differentials: ["Influenza", "Allergic rhinitis", "Bacterial sinusitis"],
        suggestedTests: ["Usually clinical diagnosis", "Rapid strep test if severe sore throat"],
    }

    const influenza = {
        name: "Influenza",
        probability: 0.72,
        description: "A viral infection affecting the respiratory system, characterized by fever, body aches, and fatigue.",
        symptoms: ["High fever", "Body aches", "Fatigue", "Dry cough", "Headache"],
        differentials: ["COVID-19", "Common cold", "Pneumonia"],
        suggestedTests: ["Influenza rapid test", "Respiratory viral panel"],
    }

    const gastroenteritis = {
        name: "Gastroenteritis",
        probability: 0.78,
        description:
            "Inflammation of the gastrointestinal tract, commonly called stomach flu, causing diarrhea and vomiting.",
        symptoms: ["Nausea", "Vomiting", "Diarrhea", "Abdominal cramps", "Low-grade fever"],
        differentials: ["Food poisoning", "Appendicitis", "Inflammatory bowel disease"],
        suggestedTests: ["Stool culture", "Stool PCR", "CBC", "Metabolic panel"],
    }

    const asthmaExacerbation = {
        name: "Asthma Exacerbation",
        probability: 0.65,
        description: "Worsening of asthma symptoms causing increased wheezing, coughing, and shortness of breath.",
        symptoms: ["Wheezing", "Shortness of breath", "Chest tightness", "Coughing", "Difficulty breathing"],
        differentials: ["COPD exacerbation", "Bronchitis", "Heart failure", "Pneumonia"],
        suggestedTests: ["Peak flow measurement", "Spirometry", "Chest X-ray", "Arterial blood gas"],
    }

    const diabeticKetoacidosis = {
        name: "Diabetic Ketoacidosis",
        probability: 0.9,
        description: "A serious complication of diabetes characterized by high blood sugar, ketones, and acidosis.",
        symptoms: [
            "Excessive thirst",
            "Frequent urination",
            "Nausea",
            "Vomiting",
            "Abdominal pain",
            "Fatigue",
            "Fruity breath",
        ],
        differentials: ["Hyperosmolar hyperglycemic state", "Alcoholic ketoacidosis", "Starvation ketosis"],
        suggestedTests: ["Blood glucose", "Urine ketones", "Arterial blood gas", "Electrolytes", "Complete blood count"],
    }

    // Map symptom keywords to conditions
    const symptomsLower = symptoms.map((s) => s.toLowerCase())
    const results = []

    if (
        symptomsLower.some(
            (s) => s.includes("cold") || s.includes("congestion") || s.includes("sneez") || s.includes("sore throat"),
        )
    ) {
        results.push(commonCold)
    }

    if (symptomsLower.some((s) => s.includes("fever") || s.includes("ache") || s.includes("fatigue"))) {
        results.push(influenza)
    }

    if (
        symptomsLower.some(
            (s) => s.includes("nausea") || s.includes("vomit") || s.includes("diarrhea") || s.includes("stomach"),
        )
    ) {
        results.push(gastroenteritis)
    }

    if (symptomsLower.some((s) => s.includes("breath") || s.includes("wheez") || s.includes("cough"))) {
        results.push(asthmaExacerbation)
    }

    if (symptomsLower.some((s) => s.includes("thirst") || s.includes("urinat") || s.includes("diabetes"))) {
        results.push(diabeticKetoacidosis)
    }

    // If no matches, return empty array
    if (results.length === 0) {
        return []
    }

    // Sort by probability
    return results.sort((a, b) => b.probability - a.probability)
}

export default function DiagnosisSuggester({ symptoms, onSelectDiagnosis }: DiagnosisSuggesterProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<any | null>(null)

    const handleGetSuggestions = async () => {
        if (symptoms.length === 0) {
            toast({
                title: "No symptoms entered",
                description: "Please enter at least one symptom to get diagnostic suggestions",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const results = await mockGetDiagnosisSuggestions(symptoms)
            setSuggestions(results)
            if (results.length === 0) {
                toast({
                    title: "No matching conditions",
                    description: "No diagnostic suggestions found for the entered symptoms",
                    variant: "default",
                })
            }
        } catch (error) {
            console.error("Error getting diagnosis suggestions:", error)
            toast({
                title: "Error",
                description: "Failed to get diagnostic suggestions",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectDiagnosis = (diagnosis: any) => {
        setSelectedDiagnosis(diagnosis)
        onSelectDiagnosis(diagnosis.name)
    }

    const formatProbability = (prob: number) => {
        return `${(prob * 100).toFixed(0)}%`
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>AI Diagnosis Suggestions</span>
                </CardTitle>
                <CardDescription>Get diagnostic suggestions based on patient symptoms</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                        <h3 className="text-sm font-medium mb-2">Current Symptoms</h3>
                        {symptoms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {symptoms.map((symptom, i) => (
                                    <div key={i} className="bg-white text-xs px-2 py-1 rounded border">
                                        {symptom}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No symptoms entered yet</p>
                        )}
                    </div>

                    <Button onClick={handleGetSuggestions} disabled={loading || symptoms.length === 0} className="w-full gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Search className="h-4 w-4" />
                        Get Diagnostic Suggestions
                    </Button>

                    {suggestions.length > 0 && !selectedDiagnosis && (
                        <div className="pt-2">
                            <h3 className="text-sm font-medium mb-3">Suggested Diagnoses</h3>
                            <div className="space-y-2">
                                {suggestions.map((suggestion, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-md border hover:border-primary cursor-pointer transition-colors"
                                        onClick={() => handleSelectDiagnosis(suggestion)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium">{suggestion.name}</div>
                                            <div className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                {formatProbability(suggestion.probability)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedDiagnosis && (
                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-medium">Diagnostic Details</h3>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedDiagnosis(null)}>
                                    Back to List
                                </Button>
                            </div>

                            <Tabs defaultValue="overview">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="differentials">Differentials</TabsTrigger>
                                    <TabsTrigger value="tests">Suggested Tests</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="pt-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">{selectedDiagnosis.name}</h4>
                                                <div className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    {formatProbability(selectedDiagnosis.probability)}
                                                </div>
                                            </div>
                                            <p className="text-sm mt-1">{selectedDiagnosis.description}</p>
                                        </div>

                                        <div>
                                            <h5 className="text-sm font-medium mb-1">Common Symptoms</h5>
                                            <ul className="list-disc pl-5 space-y-0.5">
                                                {selectedDiagnosis.symptoms.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm">
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="flex items-start gap-2 bg-amber-50 p-2 rounded text-sm">
                                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-amber-800">
                                                This is an AI suggestion only. Clinical judgment is required for final diagnosis.
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="differentials" className="pt-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Differential Diagnoses</h4>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {selectedDiagnosis.differentials.map((d: string, i: number) => (
                                                <li key={i} className="text-sm">
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex items-start gap-2 bg-slate-50 p-2 rounded text-sm">
                                            <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-slate-700">Consider these alternative diagnoses in your assessment.</div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tests" className="pt-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Recommended Diagnostic Tests</h4>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {selectedDiagnosis.suggestedTests.map((t: string, i: number) => (
                                                <li key={i} className="text-sm">
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-4">
                                <Button onClick={() => onSelectDiagnosis(selectedDiagnosis.name)} className="w-full">
                                    Use This Diagnosis
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
