"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart } from "lucide-react"

type QualityMetric = {
    metric: string
    score: number
    change: number
}

export function AIInsightQualityChart() {
    const [data, setData] = useState<QualityMetric[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // This would be a real API call in production
                // For now, use mock data
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setData([
                    { metric: "Clinical Accuracy", score: 94.2, change: 2.3 },
                    { metric: "Completeness", score: 89.7, change: 3.5 },
                    { metric: "Relevance", score: 92.1, change: 1.8 },
                    { metric: "Evidence Support", score: 87.5, change: 4.2 },
                    { metric: "Physician Acceptance", score: 91.3, change: 2.9 },
                ])
            } catch (error) {
                console.error("Error fetching quality metrics:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-[250px]" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <BarChart className="h-12 w-12 mb-2 opacity-20" />
                <p>No quality metrics data available</p>
            </div>
        )
    }

    // In a real implementation, this would render a Recharts BarChart or similar
    return (
        <div className="w-full space-y-4">
            {data.map((metric, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{metric.metric}</div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{metric.score.toFixed(1)}%</div>
                            <div className={`text-xs ${metric.change > 0 ? "text-green-500" : "text-red-500"}`}>
                                {metric.change > 0 ? "+" : ""}
                                {metric.change.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${metric.score}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}
