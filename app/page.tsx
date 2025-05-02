"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function Home() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (user) {
                if (user.role === "admin") {
                    router.push("/admin/dashboard")
                } else if (user.role === "faculty") {
                    router.push("/faculty/dashboard")
                } else {
                    router.push("/student/dashboard")
                }
            } else {
                router.push("/login")
            }
        }
    }, [user, loading, router])

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}
