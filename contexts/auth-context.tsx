"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

type UserRole = "student" | "faculty" | "admin"

type UserWithRole = User & {
    role?: UserRole
    name?: string
}

type AuthContextType = {
    user: UserWithRole | null
    session: Session | null
    loading: boolean
    signIn: (
        email: string,
        password: string,
    ) => Promise<{
        error: Error | null
    }>
    signUp: (
        email: string,
        password: string,
        role: string,
        name: string,
    ) => Promise<{
        error: Error | null
    }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserWithRole | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            setSession(session)

            if (session?.user) {
                // Fetch user role from the users table
                const { data, error } = await supabase.from("users").select("role, name").eq("id", session.user.id).single()

                if (data) {
                    setUser({
                        ...session.user,
                        role: data.role as UserRole,
                        name: data.name,
                    })
                } else {
                    setUser(session.user as UserWithRole)
                }
            }

            setLoading(false)
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session)

            if (session?.user) {
                // Fetch user role from the users table
                const { data } = await supabase.from("users").select("role, name").eq("id", session.user.id).single()

                if (data) {
                    setUser({
                        ...session.user,
                        role: data.role as UserRole,
                        name: data.name,
                    })
                } else {
                    setUser(session.user as UserWithRole)
                }
            } else {
                setUser(null)
            }

            setLoading(false)
        })

        setData()

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [router])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (!error) {
            router.refresh()
        }

        return { error }
    }

    const signUp = async (email: string, password: string, role: string, name: string) => {
        const { error, data } = await supabase.auth.signUp({
            email,
            password,
        })

        if (!error && data.user) {
            // Add user to the users table with role
            await supabase.from("users").insert({
                id: data.user.id,
                email,
                role,
                name,
            })

            // If role is student, add to students table
            if (role === "student") {
                await supabase.from("students").insert({
                    user_id: data.user.id,
                })
            }

            // If role is faculty, add to faculty table
            if (role === "faculty") {
                await supabase.from("faculty").insert({
                    user_id: data.user.id,
                })
            }

            router.refresh()
        }

        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/login")
    }

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
