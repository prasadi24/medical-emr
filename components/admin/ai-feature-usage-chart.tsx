"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { aiLogger } from "@/app/actions/ai-logging-actions"
import { PieChart } from "lucide-react"

type FeatureUsage = {
    feature: string
    count: number
    percentage: number
}

export function AIFeatureUsageChart() {
    const [data, setData] = useState<FeatureUsage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const analytics = await aiLogger.getAnalytics("week")
                setData(analytics.featureBreakdown)
            } catch (error) {
                console.error("Error fetching feature usage:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-[300px] h-[300px] rounded-full" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <PieChart className="h-12 w-12 mb-2 opacity-20" />
                <p>No feature usage data available</p>
            </div>
        )
    }

    // In a real implementation, this would render a Recharts PieChart or similar
    return (
        <div className="w-full space-y-4">
            {data.map((feature, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{feature.feature}</div>
                        <div className="text-sm text-muted-foreground">{feature.count} requests</div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${feature.percentage}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}
