"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, LineChart, Stethoscope, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type AIMetric = {
    title: string
    value: string
    change: string
    isPositive: boolean
}

type AIInsight = {
    category: string
    insight: string
    priority: "low" | "medium" | "high"
    date: string
}

type AIInsightsWidgetProps = {
    clinicId?: string
}

export default function AIInsightsWidget({ clinicId }: AIInsightsWidgetProps) {
    const [activeTab, setActiveTab] = useState("metrics")
    const [metrics, setMetrics] = useState<AIMetric[]>([])
    const [insights, setInsights] = useState<AIInsight[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock data fetch
        const fetchData = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Mock metrics
            const mockMetrics = [
                {
                    title: "Patient Satisfaction",
                    value: "92%",
                    change: "+5%",
                    isPositive: true,
                },
                {
                    title: "Readmission Rate",
                    value: "3.2%",
                    change: "-1.8%",
                    isPositive: true,
                },
                {
                    title: "Treatment Efficacy",
                    value: "87%",
                    change: "+2%",
                    isPositive: true,
                },
                {
                    title: "Risk Predictions",
                    value: "89%",
                    change: "+4%",
                    isPositive: true,
                },
            ]

            // Mock insights
            const mockInsights = [
                {
                    category: "Clinical",
                    insight: "Patients with diabetes have 15% higher appointment no-show rates. Consider targeted reminders.",
                    priority: "medium",
                    date: "2 days ago",
                },
                {
                    category: "Operational",
                    insight: "Tuesday 2-4 PM has the highest wait times. Consider adding additional staff during this period.",
                    priority: "high",
                    date: "5 days ago",
                },
                {
                    category: "Financial",
                    insight: "Lab test orders increased 23% while revenue increased only 9%. Review lab billing procedures.",
                    priority: "medium",
                    date: "1 week ago",
                },
                {
                    category: "Clinical",
                    insight:
                        "Patients prescribed medication X show better outcomes than those on medication Y for similar diagnoses.",
                    priority: "high",
                    date: "2 weeks ago",
                },
            ] as AIInsight[]

            setMetrics(mockMetrics)
            setInsights(mockInsights)
            setLoading(false)
        }

        fetchData()
    }, [clinicId])

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800"
            case "medium":
                return "bg-amber-100 text-amber-800"
            case "low":
                return "bg-green-100 text-green-800"
            default:
                return "bg-slate-100 text-slate-800"
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    <span>AI Insights</span>
                </CardTitle>
                <CardDescription>AI-powered analytics and insights for your medical practice</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="metrics" onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                        <TabsTrigger value="insights">Smart Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="metrics" className="pt-4">
                        {loading ? (
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-slate-100 animate-pulse h-24 rounded-md"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {metrics.map((metric, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-md">
                                        <div className="text-sm text-muted-foreground">{metric.title}</div>
                                        <div className="text-2xl font-bold mt-1">{metric.value}</div>
                                        <div className={`text-xs mt-1 ${metric.isPositive ? "text-green-600" : "text-red-600"}`}>
                                            {metric.change} from last month
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm" className="gap-1">
                                <LineChart className="h-4 w-4" />
                                <span>View Detailed Analytics</span>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="pt-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-100 animate-pulse h-20 rounded-md"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {insights.map((insight, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-md">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-1">
                                                {insight.category === "Clinical" && <Stethoscope className="h-4 w-4 text-primary" />}
                                                {insight.category === "Operational" && <LineChart className="h-4 w-4 text-indigo-500" />}
                                                {insight.category === "Financial" && <LineChart className="h-4 w-4 text-green-600" />}
                                                <span className="text-sm font-medium">{insight.category}</span>
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded ${getPriorityClass(insight.priority)}`}>
                                                {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                                            </div>
                                        </div>
                                        <p className="text-sm">{insight.insight}</p>
                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {insight.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm">
                                View All Insights
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
