"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart } from "lucide-react"

type DepartmentUsage = {
    department: string
    count: number
    percentage: number
}

export function AIUsageByDepartmentChart() {
    const [data, setData] = useState<DepartmentUsage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // This would be a real API call in production
                // For now, use mock data
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setData([
                    { department: "Internal Medicine", count: 356, percentage: 42 },
                    { department: "Cardiology", count: 203, percentage: 24 },
                    { department: "Neurology", count: 147, percentage: 17 },
                    { department: "Pediatrics", count: 85, percentage: 10 },
                    { department: "Other", count: 59, percentage: 7 },
                ])
            } catch (error) {
                console.error("Error fetching department usage:", error)
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
                <p>No department usage data available</p>
            </div>
        )
    }

    // In a real implementation, this would render a Recharts PieChart or similar
    return (
        <div className="w-full space-y-4">
            {data.map((dept, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{dept.department}</div>
                        <div className="text-sm text-muted-foreground">{dept.count} requests</div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}
