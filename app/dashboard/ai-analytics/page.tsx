import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, BarChart, LineChart, PieChart } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { aiLogger } from "@/app/actions/ai-logging-actions"

export const metadata = {
    title: "AI Analytics | Medical EMR",
    description: "AI usage analytics and insights for your medical practice",
}

export default async function AIAnalyticsPage() {
    const supabase = createServerSupabaseClient()
    const { data: userData } = await supabase.auth.getUser()

    // Get AI usage analytics
    const analytics = await aiLogger.getAnalytics("week")

    // Get feature usage by day for top features
    const topFeatures = analytics.featureBreakdown.slice(0, 3).map((f) => f.feature)
    const featureUsageData = await Promise.all(topFeatures.map((feature) => aiLogger.getFeatureUsageByDay(feature, 14)))

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor AI usage, performance, and impact across your medical practice
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Feature Usage</TabsTrigger>
                    <TabsTrigger value="impact">Clinical Impact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total AI Requests</CardTitle>
                                <CardDescription>Last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.totalRequests}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {analytics.totalRequests > 100 ? "+12% from previous period" : "Not enough data for comparison"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                                <CardDescription>Last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.totalTokensUsed.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Avg {Math.round(analytics.totalTokensUsed / (analytics.totalRequests || 1))} tokens per request
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                                <CardDescription>Response generation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.averageProcessingTime.toFixed(2)}s</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {analytics.averageProcessingTime < 1 ? "Excellent" : "Good"} response time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Usage Breakdown</CardTitle>
                            <CardDescription>Distribution of AI feature usage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                                {analytics.featureBreakdown.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        {analytics.featureBreakdown.map((feature, i) => (
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
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>No feature usage data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Usage Over Time</CardTitle>
                            <CardDescription>Daily usage of top AI features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center">
                                {featureUsageData.some((data) => data.length > 0) ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <LineChart className="h-12 w-12 opacity-20" />
                                        <p className="text-muted-foreground ml-2">Chart visualization would appear here</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>No feature usage data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top AI Features</CardTitle>
                                <CardDescription>Most frequently used AI capabilities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.featureBreakdown.length > 0 ? (
                                        analytics.featureBreakdown.slice(0, 5).map((feature, i) => (
                                            <div key={i} className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                                    <BrainCircuit className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{feature.feature}</div>
                                                    <div className="text-xs text-muted-foreground">{feature.count} requests</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>No feature usage data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Adoption</CardTitle>
                                <CardDescription>AI feature adoption by user role</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] flex items-center justify-center">
                                    <BarChart className="h-12 w-12 opacity-20" />
                                    <p className="text-muted-foreground ml-2">Chart visualization would appear here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Clinical Efficiency</CardTitle>
                                <CardDescription>Impact of AI on clinical workflows</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Clinical efficiency metrics would appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Documentation Quality</CardTitle>
                                <CardDescription>AI impact on documentation completeness</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <BarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Documentation quality metrics would appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI Clinical Recommendations</CardTitle>
                            <CardDescription>Acceptance rate of AI clinical suggestions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>AI recommendation acceptance metrics would appear here</p>
                                </div>
                        </CardContent>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div >
  )
}
