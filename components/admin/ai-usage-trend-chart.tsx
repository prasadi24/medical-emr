"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart } from "lucide-react"

type TrendData = {
    date: string
    requests: number
    tokens: number
}

export function AIUsageTrendChart() {
    const [data, setData] = useState<TrendData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // This would be a real API call in production
                // For now, generate mock data for the last 14 days
                await new Promise((resolve) => setTimeout(resolve, 1000))

                const mockData = Array.from({ length: 14 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (13 - i))
                    const dateStr = date.toISOString().split("T")[0]

                    // Generate some realistic looking data with an upward trend
                    const baseRequests = 100 + i * 10
                    const noise = Math.random() * 30 - 15 // Random noise between -15 and 15
                    const requests = Math.round(baseRequests + noise)

                    // Tokens are typically a multiple of requests
                    const tokens = requests * (Math.floor(Math.random() * 200) + 800)

                    return {
                        date: dateStr,
                        requests,
                        tokens,
                    }
                })

                setData(mockData)
            } catch (error) {
                console.error("Error fetching trend data:", error)
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
                <LineChart className="h-12 w-12 mb-2 opacity-20" />
                <p>No usage trend data available</p>
            </div>
        )
    }

    // In a real implementation, this would render a Recharts LineChart or similar
    // For now, just show a simplified representation
    return (
        <div className="w-full space-y-6">
            <div className="flex justify-end gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Requests</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Tokens</span>
                </div>
            </div>

            <div className="border p-4 rounded-md bg-slate-50">
                <div className="text-center text-muted-foreground mb-4">
                    <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Chart visualization would appear here</p>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {data.slice(-7).map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="text-xs font-medium">
                                {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-xs text-muted-foreground">{item.requests} req</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
