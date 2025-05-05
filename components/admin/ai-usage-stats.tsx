"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, BarChart, Users, Zap } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { getAIUsageStats } from "@/app/actions/ai-logging-actions"

type TimeFrame = "day" | "week" | "month"

export default function AIUsageStats() {
    const { toast } = useToast()
    const [timeframe, setTimeframe] = useState<TimeFrame>("week")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        loadStats(timeframe)
    }, [timeframe])

    const loadStats = async (tf: TimeFrame) => {
        setLoading(true)
        try {
            const result = await getAIUsageStats(tf)
            if (result.success && result.data) {
                setStats(result.data)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load AI usage statistics",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error loading AI usage stats:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const formatTimeframeLabel = (tf: TimeFrame) => {
        switch (tf) {
            case "day": return "Last 24 Hours"
            case "week": return "Last 7 Days"
            case "month": return "Last 30 Days"
        }
    }

    if (loading && !stats) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as TimeFrame)}>
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button variant="outline" size="sm" onClick={() => loadStats(timeframe)} className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <BarChart className="h-8 w-8 text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{stats.totalRequests}</h3>
                                <p className="text-sm text-muted-foreground">Total AI Requests</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatTimeframeLabel(timeframe)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Zap className="h-8 w-8 text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</h3>
                                <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatTimeframeLabel(timeframe)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Users className="h-8 w-8 text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{stats.byUser?.length || 0}</h3>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatTimeframeLabel(timeframe)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No usage data available for this time period</p>
                </div>
            )}

            {stats && stats.byFeature && stats.byFeature.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Usage by Feature</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-3">
                            {stats.byFeature.map((feature: any, index: number) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="text-sm font-medium">{feature.ai_feature}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm">{feature.count} requests</div>
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${Math.max(20, (feature.count / stats.totalRequests) * 200)}px`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
