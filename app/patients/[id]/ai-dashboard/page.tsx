import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BrainCircuit, AlertCircle, Activity, ChevronLeft, Stethoscope, LineChart } from "lucide-react"
import PatientRiskAssessment from "@/components/ai/patient-risk-assessment"
import PatientAIChat from "@/components/ai/patient-ai-chat"

export async function generateMetadata({ params }: { params: { id: string } }) {
    const supabase = createServerSupabaseClient()

    const { data: patient } = await supabase.from("patients").select("first_name, last_name").eq("id", params.id).single()

    if (!patient) {
        return {
            title: "Patient Not Found",
        }
    }

    return {
        title: `AI Dashboard - ${patient.first_name} ${patient.last_name} | Medical EMR`,
        description: "AI-powered insights and tools for patient care",
    }
}

async function PatientAIDashboardContent({ patientId }: { patientId: string }) {
    const supabase = createServerSupabaseClient()

    const { data: patient, error } = await supabase
        .from("patients")
        .select(`
      *,
      medical_records (
        id,
        visit_date,
        diagnosis,
        treatment_plan,
        ai_insights,
        ai_treatment_suggestions,
        created_at
      )
    `)
        .eq("id", patientId)
        .single()

    if (error || !patient) {
        console.error("Error fetching patient:", error)
        notFound()
    }

    // Get the most recent medical record
    const sortedRecords = patient.medical_records
        ? [...patient.medical_records].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : []

    const latestRecord = sortedRecords.length > 0 ? sortedRecords[0] : null

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    AI-powered insights and tools for {patient.first_name} {patient.last_name}
                </p>
            </div>

            <Tabs defaultValue="insights" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="insights" className="gap-1">
                        <BrainCircuit className="h-4 w-4" />
                        Clinical Insights
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Risk Assessment
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-1">
                        <Activity className="h-4 w-4" />
                        Patient Chat
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5" />
                                    <span>AI Clinical Summary</span>
                                </CardTitle>
                                <CardDescription>AI-generated summary of patient's clinical history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                                            <Stethoscope className="h-4 w-4" />
                                            Key Conditions
                                        </h3>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {patient.medical_history?.conditions?.slice(0, 3).map((condition: string, i: number) => (
                                                <li key={i} className="text-sm">
                                                    {condition}
                                                </li>
                                            )) || <li className="text-sm text-muted-foreground">No conditions recorded</li>}
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Recent Diagnosis</h3>
                                        <p className="text-sm">{latestRecord?.diagnosis || "No recent diagnosis"}</p>
                                        {latestRecord?.visit_date && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Diagnosed on {new Date(latestRecord.visit_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Current Treatment</h3>
                                        <p className="text-sm">{latestRecord?.treatment_plan || "No active treatment plan"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LineChart className="h-5 w-5" />
                                    <span>Health Trends</span>
                                </CardTitle>
                                <CardDescription>AI-analyzed health trends and patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Health trend visualization would appear here</p>
                                        <p className="text-xs mt-1">Based on vitals, lab results, and visit history</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <span>Care Recommendations</span>
                            </CardTitle>
                            <CardDescription>AI-generated care recommendations based on patient history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-4 rounded-md">
                                    <h3 className="text-sm font-medium mb-2 text-amber-800">Preventive Care</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li className="text-sm text-amber-800">Annual physical examination due in 2 months</li>
                                        <li className="text-sm text-amber-800">Consider screening for hypertension at next visit</li>
                                        <li className="text-sm text-amber-800">Flu vaccination recommended before winter season</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md">
                                    <h3 className="text-sm font-medium mb-2 text-blue-800">Monitoring Recommendations</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li className="text-sm text-blue-800">Regular blood pressure monitoring advised</li>
                                        <li className="text-sm text-blue-800">Follow-up on recent lab work within 3 months</li>
                                    </ul>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-md">
                                    <h3 className="text-sm font-medium mb-2">Lifestyle Recommendations</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li className="text-sm">Increase physical activity to at least 30 minutes daily</li>
                                        <li className="text-sm">Maintain a balanced diet rich in fruits and vegetables</li>
                                        <li className="text-sm">Reduce sodium intake to help manage blood pressure</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="risk" className="space-y-6">
                    <PatientRiskAssessment patientId={patientId} patientData={patient} />
                </TabsContent>

                <TabsContent value="chat" className="space-y-6">
                    <PatientAIChat patientId={patientId} patientName={`${patient.first_name} ${patient.last_name}`} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function PatientAIDashboardPage({ params }: { params: { id: string } }) {
    return (
        <div className="container py-10">
            <div className="mb-6">
                <Link
                    href={`/patients/${params.id}`}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Back to Patient</span>
                </Link>
            </div>

            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <PatientAIDashboardContent patientId={params.id} />
            </Suspense>
        </div>
    )
}
