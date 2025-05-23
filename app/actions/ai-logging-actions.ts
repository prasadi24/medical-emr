"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

type AIUsageLogData = {
    userId: string
    aiFeature: string
    entityType?: string
    entityId?: string
    requestData?: any
    responseSummary?: string
    tokensUsed?: number
    processingTime?: number
}

type AIUsageAnalytics = {
    totalRequests: number
    totalTokensUsed: number
    averageProcessingTime: number
    featureBreakdown: {
        feature: string
        count: number
        percentage: number
    }[]
}

export const aiLogger = {
    /**
     * Log AI usage
     */
    async logUsage({
        userId,
        aiFeature,
        entityType,
        entityId,
        requestData,
        responseSummary,
        tokensUsed,
        processingTime,
    }: AIUsageLogData) {
        try {
            const supabase = createServerSupabaseClient()

            const { error } = await supabase.from("ai_usage_logs").insert({
                id: uuidv4(),
                user_id: userId,
                ai_feature: aiFeature,
                entity_type: entityType,
                entity_id: entityId,
                request_data: requestData,
                response_summary: responseSummary,
                tokens_used: tokensUsed || 0,
                processing_time: processingTime || 0,
            })

            if (error) {
                console.error("Error logging AI usage:", error)
                return { success: false, error }
            }

            return { success: true }
        } catch (error) {
            console.error("Error in AI logger:", error)
            return { success: false, error }
        }
    },

    /**
     * Get AI usage analytics
     */
    async getAnalytics(timeframe: "day" | "week" | "month" = "week", userId?: string): Promise<AIUsageAnalytics> {
        try {
            const supabase = createServerSupabaseClient()

            // Calculate date range based on timeframe
            const now = new Date()
            let startDate: Date
            switch (timeframe) {
                case "day":
                    startDate = new Date(now.setDate(now.getDate() - 1))
                    break
                case "month":
                    startDate = new Date(now.setMonth(now.getMonth() - 1))
                    break
                case "week":
                default:
                    startDate = new Date(now.setDate(now.getDate() - 7))
                    break
            }

            // Build query
            let query = supabase.from("ai_usage_logs").select("*").gte("created_at", startDate.toISOString())

            if (userId) {
                query = query.eq("user_id", userId)
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching AI usage analytics:", error)
                return {
                    totalRequests: 0,
                    totalTokensUsed: 0,
                    averageProcessingTime: 0,
                    featureBreakdown: [],
                }
            }

            // Calculate analytics
            const totalRequests = data.length
            const totalTokensUsed = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0)
            const totalProcessingTime = data.reduce((sum, log) => sum + (log.processing_time || 0), 0)
            const averageProcessingTime = totalRequests > 0 ? totalProcessingTime / totalRequests : 0

            // Group by feature
            const featureCounts: Record<string, number> = {}
            data.forEach((log) => {
                const feature = log.ai_feature
                featureCounts[feature] = (featureCounts[feature] || 0) + 1
            })

            // Create feature breakdown
            const featureBreakdown = Object.entries(featureCounts).map(([feature, count]) => ({
                feature,
                count,
                percentage: (count / totalRequests) * 100,
            }))

            // Sort by count descending
            featureBreakdown.sort((a, b) => b.count - a.count)

            return {
                totalRequests,
                totalTokensUsed,
                averageProcessingTime,
                featureBreakdown,
            }
        } catch (error) {
            console.error("Error in AI analytics:", error)
            return {
                totalRequests: 0,
                totalTokensUsed: 0,
                averageProcessingTime: 0,
                featureBreakdown: [],
            }
        }
    },

    /**
     * Get feature usage by day
     */
    async getFeatureUsageByDay(feature: string, days = 30): Promise<{ date: string; count: number }[]> {
        try {
            const supabase = createServerSupabaseClient()

            // Calculate start date
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            // Get usage data
            const { data, error } = await supabase
                .from("ai_usage_logs")
                .select("created_at")
                .eq("ai_feature", feature)
                .gte("created_at", startDate.toISOString())

            if (error) {
                console.error("Error fetching feature usage:", error)
                return []
            }

            // Group by day
            const usageByDay: Record<string, number> = {}

            // Initialize all days with zero count
            for (let i = 0; i < days; i++) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split("T")[0]
                usageByDay[dateStr] = 0
            }

            // Count usage by day
            data.forEach((log) => {
                const dateStr = new Date(log.created_at).toISOString().split("T")[0]
                usageByDay[dateStr] = (usageByDay[dateStr] || 0) + 1
            })

            // Convert to array and sort by date
            return Object.entries(usageByDay)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date))
        } catch (error) {
            console.error("Error in feature usage by day:", error)
            return []
        }
    },

    /**
     * Get AI usage statistics
     */
    async getAIUsageStatistics() {
        try {
            const supabase = createServerSupabaseClient()

            // Get total requests
            const { count: totalRequests, error: countError } = await supabase
                .from("ai_usage_logs")
                .select("*", { count: "exact", head: true })

            if (countError) {
                console.error("Error getting total requests:", countError)
                return { success: false, message: "Failed to get total requests", error: countError }
            }

            // Get total tokens
            const { data: tokenData, error: tokenError } = await supabase
                .from("ai_usage_logs")
                .select("tokens_used")
                .limit(1000) // Limit to prevent loading too much data

            if (tokenError) {
                console.error("Error getting token data:", tokenError)
                return { success: false, message: "Failed to get token data", error: tokenError }
            }

            const totalTokens = tokenData?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0

            // Get average response time
            const { data: timeData, error: timeError } = await supabase
                .from("ai_usage_logs")
                .select("processing_time")
                .limit(1000) // Limit to prevent loading too much data

            if (timeError) {
                console.error("Error getting response time data:", timeError)
                return { success: false, message: "Failed to get response time data", error: timeError }
            }

            const totalTime = timeData?.reduce((sum, log) => sum + (log.processing_time || 0), 0) || 0
            const averageResponseTime = timeData && timeData.length > 0 ? totalTime / timeData.length : 0

            // Get feature breakdown
            const { data: featureData, error: featureError } = await supabase
                .from("ai_usage_logs")
                .select("ai_feature")
                .limit(1000) // Limit to prevent loading too much data

            if (featureError) {
                console.error("Error getting feature data:", featureError)
                return { success: false, message: "Failed to get feature data", error: featureError }
            }

            const featureBreakdown: Record<string, number> = {}
            featureData?.forEach((log) => {
                const feature = log.ai_feature || "unknown"
                featureBreakdown[feature] = (featureBreakdown[feature] || 0) + 1
            })

            // Calculate quality score based on feedback (mocked for now)
            const qualityScore = 92.5

            // Calculate cost estimate (mocked for now)
            const costEstimate = totalTokens ? totalTokens * 0.000002 : 0

            return {
                success: true,
                data: {
                    totalRequests: totalRequests || 0,
                    totalTokens,
                    averageResponseTime,
                    featureBreakdown,
                    qualityScore,
                    costEstimate,
                },
            }
        } catch (error) {
            console.error("Error getting AI usage statistics:", error)
            return { success: false, message: "An unexpected error occurred", error }
        }
    },
}

export async function getAIUsageStatistics() {
    return aiLogger.getAIUsageStatistics()
}
