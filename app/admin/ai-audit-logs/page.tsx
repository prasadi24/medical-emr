import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, Shield, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "AI Audit Logs | Medical EMR",
    description: "Review AI usage and compliance logs",
}

export default async function AIAuditLogsPage() {
    const supabase = createServerSupabaseClient()

    // Get AI usage logs
    const { data: aiLogs, error: aiLogsError } = await supabase
        .from("ai_usage_logs")
        .select(`
      *,
      users:user_id (
        email,
        user_profiles (
          first_name,
          last_name
        )
      )
    `)
        .order("created_at", { ascending: false })
        .limit(100)

    // Get AI feedback logs
    const { data: feedbackLogs, error: feedbackError } = await supabase
        .from("ai_feedback")
        .select(`
      *,
      users:user_id (
        email,
        user_profiles (
          first_name,
          last_name
        )
      ),
      ai_usage_logs (
        ai_feature
      )
    `)
        .order("created_at", { ascending: false })
        .limit(50)

    // Get high-risk AI interactions (mock data for now)
    const highRiskInteractions = [
        {
            id: "risk-1",
            timestamp: new Date().toISOString(),
            feature: "clinical_insights",
            user: "Dr. Sarah Johnson",
            risk_level: "high",
            reason: "Sensitive patient data in prompt",
            action_taken: "Automatically redacted",
        },
        {
            id: "risk-2",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            feature: "treatment_suggestions",
            user: "Dr. Michael Chen",
            risk_level: "medium",
            reason: "Unusual treatment recommendation",
            action_taken: "Flagged for review",
        },
        {
            id: "risk-3",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            feature: "diagnosis_suggestions",
            user: "Dr. Emily Wilson",
            risk_level: "high",
            reason: "Contradictory to patient history",
            action_taken: "Blocked and logged",
        },
    ]

    // Format logs for display
    const formattedAILogs =
        aiLogs?.map((log) => {
            const userName = log.users?.user_profiles
                ? `${log.users.user_profiles.first_name} ${log.users.user_profiles.last_name}`
                : log.users?.email || "Unknown User"

            return {
                id: log.id,
                timestamp: new Date(log.created_at).toLocaleString(),
                feature: log.ai_feature,
                user: userName,
                tokens: log.tokens_used || 0,
                processingTime: `${(log.processing_time / 1000).toFixed(2)}s`,
                entityType: log.entity_type || "N/A",
                entityId: log.entity_id || "N/A",
            }
        }) || []

    const formattedFeedbackLogs =
        feedbackLogs?.map((log) => {
            const userName = log.users?.user_profiles
                ? `${log.users.user_profiles.first_name} ${log.users.user_profiles.last_name}`
                : log.users?.email || "Unknown User"

            return {
                id: log.id,
                timestamp: new Date(log.created_at).toLocaleString(),
                feature: log.ai_usage_logs?.ai_feature || "Unknown",
                user: userName,
                rating: log.rating,
                isHelpful: log.is_helpful ? "Yes" : "No",
                isAccurate: log.is_accurate ? "Yes" : "No",
                feedback: log.feedback || "No feedback provided",
            }
        }) || []

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">Review AI usage, feedback, and compliance logs</p>
                </div>
                <Button variant="outline" className="gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Export Compliance Report</span>
                </Button>
            </div>

            <Tabs defaultValue="usage" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="usage">Usage Logs</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback Logs</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5" />
                                <span>AI Usage Logs</span>
                            </CardTitle>
                            <CardDescription>Detailed logs of all AI interactions in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-slate-50">
                                            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                                            <th className="px-4 py-3 text-left font-medium">Feature</th>
                                            <th className="px-4 py-3 text-left font-medium">User</th>
                                            <th className="px-4 py-3 text-left font-medium">Tokens</th>
                                            <th className="px-4 py-3 text-left font-medium">Processing Time</th>
                                            <th className="px-4 py-3 text-left font-medium">Entity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formattedAILogs.length > 0 ? (
                                            formattedAILogs.map((log) => (
                                                <tr key={log.id} className="border-b">
                                                    <td className="px-4 py-3">{log.timestamp}</td>
                                                    <td className="px-4 py-3">{log.feature}</td>
                                                    <td className="px-4 py-3">{log.user}</td>
                                                    <td className="px-4 py-3">{log.tokens}</td>
                                                    <td className="px-4 py-3">{log.processingTime}</td>
                                                    <td className="px-4 py-3">
                                                        {log.entityType !== "N/A" ? `${log.entityType}: ${log.entityId}` : "N/A"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                                                    No usage logs found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <span>AI Feedback Logs</span>
                            </CardTitle>
                            <CardDescription>User feedback on AI-generated content</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-slate-50">
                                            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                                            <th className="px-4 py-3 text-left font-medium">Feature</th>
                                            <th className="px-4 py-3 text-left font-medium">User</th>
                                            <th className="px-4 py-3 text-left font-medium">Rating</th>
                                            <th className="px-4 py-3 text-left font-medium">Helpful</th>
                                            <th className="px-4 py-3 text-left font-medium">Accurate</th>
                                            <th className="px-4 py-3 text-left font-medium">Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formattedFeedbackLogs.length > 0 ? (
                                            formattedFeedbackLogs.map((log) => (
                                                <tr key={log.id} className="border-b">
                                                    <td className="px-4 py-3">{log.timestamp}</td>
                                                    <td className="px-4 py-3">{log.feature}</td>
                                                    <td className="px-4 py-3">{log.user}</td>
                                                    <td className="px-4 py-3">{log.rating}/5</td>
                                                    <td className="px-4 py-3">{log.isHelpful}</td>
                                                    <td className="px-4 py-3">{log.isAccurate}</td>
                                                    <td className="px-4 py-3 max-w-xs truncate">{log.feedback}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
                                                    No feedback logs found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span>Compliance Alerts</span>
                            </CardTitle>
                            <CardDescription>High-risk AI interactions that required intervention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-slate-50">
                                            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                                            <th className="px-4 py-3 text-left font-medium">Feature</th>
                                            <th className="px-4 py-3 text-left font-medium">User</th>
                                            <th className="px-4 py-3 text-left font-medium">Risk Level</th>
                                            <th className="px-4 py-3 text-left font-medium">Reason</th>
                                            <th className="px-4 py-3 text-left font-medium">Action Taken</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {highRiskInteractions.map((interaction) => (
                                            <tr key={interaction.id} className="border-b">
                                                <td className="px-4 py-3">{new Date(interaction.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-3">{interaction.feature}</td>
                                                <td className="px-4 py-3">{interaction.user}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${interaction.risk_level === "high"
                                                                ? "bg-red-100 text-red-800"
                                                                : interaction.risk_level === "medium"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                            }`}
                                                    >
                                                        {interaction.risk_level.charAt(0).toUpperCase() + interaction.risk_level.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{interaction.reason}</td>
                                                <td className="px-4 py-3">{interaction.action_taken}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
