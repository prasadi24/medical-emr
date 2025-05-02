import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <main className="p-4 md:p-8">{children}</main>
            </div>
        </div>
    )
}
