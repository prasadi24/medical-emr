"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, BarChart, LineChart } from 'lucide-react'
import { aiLogger } from "@/app/actions/ai-logging-actions"

type AIUsageStatsProps = {
    userId?: string
    timeframe?: "day" | "week" | "month"
}

export default function AIUsageStats({ userId, timeframe = "week" }: AIUsageStatsProps) {
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState<any>({
        totalRequests: 0,
        totalTokensUsed: 0,
        averageProcessingTime: 0,
        featureBreakdown: [],
    })
    const [featureUsage, setFeatureUsage] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Get analytics data
                const analyticsData = await aiLogger.getAnalytics(timeframe, userId)
                setAnalytics(analyticsData)

                // Get feature usage data for top features
                const topFeatures = analyticsData.featureBreakdown.slice(0, 3).map((f) => f.feature)
                const featureData = await Promise.all(
                    topFeatures.map(async (feature) => {
                        const usageData = await aiLogger.getFeatureUsageByDay(feature, timeframe === "day" ? 7 : 14)
                        return {
                            feature,
                            data: usageData,
                        }
                    }),
                )
                setFeatureUsage(featureData)
            } catch (error) {
                console.error("Error fetching AI usage stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [timeframe, userId])

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    <span>AI Usage Statistics</span>
                </CardTitle>
                <CardDescription>
                    {timeframe === "day"
                        ? "Last 24 hours"
                        : timeframe === "week"
                            ? "Last 7 days"
                            : "Last 30 days"} AI usage metrics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Feature Usage</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-3 rounded-md">
                                <div className="text-sm text-muted-foreground">Total Requests</div>
                                <div className="text-2xl font-bold mt-1">{analytics.totalRequests}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md">
                                <div className="text-sm text-muted-foreground">Tokens Used</div>
                                <div className="text-2xl font-bold mt-1">{analytics.totalTokensUsed.toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md">
                                <div className="text-sm text-muted-foreground">Avg Response Time</div>
                                <div className="text-2xl font-bold mt-1">{analytics.averageProcessingTime.toFixed(2)}s</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Feature Distribution</h4>
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 bg-slate-100 animate-pulse rounded-md"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.featureBreakdown.map((feature: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">{feature.feature}</div>
                                                <div className="text-sm text-muted-foreground">{feature.count} requests</div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${feature.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="features" className="pt-4">
                        <div className="space-y-6">
                            <div className="h-[200px] flex items-center justify-center">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-md"></div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <LineChart className="h-12 w-12 opacity-20" />
                                        <p className="text-muted-foreground ml-2">Feature usage chart would appear here</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3">Top Features</h4>
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-md"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {featureUsage.map((feature, i) => (
                                            <div key={i} className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                                    <BrainCircuit className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{feature.feature}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {feature.data.reduce((sum: number, day: any) => sum + day.count, 0)} total uses
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
