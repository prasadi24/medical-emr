"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { aiLogger } from "@/app/actions/ai-logging-actions"
import { BarChart } from "lucide-react"

type TokenUsageData = {
    timeframe: string
    promptTokens: number
    completionTokens: number
}

export function AITokenUsageChart() {
    const [data, setData] = useState<TokenUsageData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // This would be a separate API call in a real implementation
                // For now, we'll mock this with timeframes
                const dayAnalytics = await aiLogger.getAnalytics("day")
                const weekAnalytics = await aiLogger.getAnalytics("week")
                const monthAnalytics = await aiLogger.getAnalytics("month")

                // Estimate prompt vs completion tokens (normally this would come from the API)
                const estimateTokenBreakdown = (total: number) => ({
                    promptTokens: Math.round(total * 0.3),
                    completionTokens: Math.round(total * 0.7),
                })

                setData([
                    {
                        timeframe: "Day",
                        ...estimateTokenBreakdown(dayAnalytics.totalTokensUsed),
                    },
                    {
                        timeframe: "Week",
                        ...estimateTokenBreakdown(weekAnalytics.totalTokensUsed),
                    },
                    {
                        timeframe: "Month",
                        ...estimateTokenBreakdown(monthAnalytics.totalTokensUsed),
                    },
                ])
            } catch (error) {
                console.error("Error fetching token usage:", error)
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
                <p>No token usage data available</p>
            </div>
        )
    }

    // In a real implementation, this would render a Recharts BarChart or similar
    return (
        <div className="w-full space-y-6">
            {data.map((item, i) => (
                <div key={i} className="space-y-2">
                    <div className="text-sm font-medium">{item.timeframe}</div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Prompt Tokens</span>
                            <span>{item.promptTokens.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(item.promptTokens / (item.promptTokens + item.completionTokens)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Completion Tokens</span>
                            <span>{item.completionTokens.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(item.completionTokens / (item.promptTokens + item.completionTokens)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
