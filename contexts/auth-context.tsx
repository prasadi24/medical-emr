"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

type UserRole = {
    id: number
    name: string
    description: string | null
}

type UserWithRoles = User & {
    roles: UserRole[]
}

type AuthContextType = {
    user: UserWithRoles | null
    session: Session | null
    isLoading: boolean
    signIn: (
        email: string,
        password: string,
    ) => Promise<{
        error: Error | null
        data: Session | null
    }>
    signUp: (
        email: string,
        password: string,
    ) => Promise<{
        error: Error | null
        data: { user: User | null; session: Session | null }
    }>
    signOut: () => Promise<void>
    hasRole: (roleName: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserWithRoles | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClientSupabaseClient()

    useEffect(() => {
        const fetchUserRoles = async (userId: string) => {
            const { data: userRoles } = await supabase.from("user_roles").select("role_id").eq("user_id", userId)

            if (userRoles) {
                const roleIds = userRoles.map((ur) => ur.role_id)
                const { data: roles } = await supabase.from("roles").select("*").in("id", roleIds)

                return roles || []
            }
            return []
        }

        const setupUser = async (session: Session | null) => {
            if (session?.user) {
                const roles = await fetchUserRoles(session.user.id)
                setUser({
                    ...session.user,
                    roles,
                })
            } else {
                setUser(null)
            }
            setIsLoading(false)
        }

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setupUser(session)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session)
            await setupUser(session)
            router.refresh()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    const signIn = async (email: string, password: string) => {
        setIsLoading(true)
        const response = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        setIsLoading(false)
        return response
    }

    const signUp = async (email: string, password: string) => {
        setIsLoading(true)
        const response = await supabase.auth.signUp({
            email,
            password,
        })
        setIsLoading(false)
        return response
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const hasRole = (roleName: string) => {
        if (!user || !user.roles) return false
        return user.roles.some((role) => role.name === roleName)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signIn,
                signUp,
                signOut,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
