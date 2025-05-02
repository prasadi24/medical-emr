"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    CalendarIcon,
    ClipboardListIcon,
    LayoutDashboardIcon,
    LogOutIcon,
    MenuIcon,
    Settings2Icon,
    UserIcon,
    UsersIcon,
    XIcon,
} from "lucide-react"

type SidebarItem = {
    title: string
    href: string
    icon: React.ElementType
    roles?: string[]
}

const sidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Patients",
        href: "/patients",
        icon: UsersIcon,
        roles: ["Admin", "Doctor", "Nurse", "Receptionist"],
    },
    {
        title: "Appointments",
        href: "/appointments",
        icon: CalendarIcon,
        roles: ["Admin", "Doctor", "Nurse", "Receptionist"],
    },
    {
        title: "Medical Records",
        href: "/medical-records",
        icon: ClipboardListIcon,
        roles: ["Admin", "Doctor", "Nurse"],
    },
    {
        title: "User Management",
        href: "/users",
        icon: UserIcon,
        roles: ["Admin"],
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings2Icon,
    },
]

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { user, hasRole, signOut } = useAuth()

    const filteredItems = sidebarItems.filter((item) => !item.roles || item.roles.some((role) => hasRole(role)))

    return (
        <>
            {/* Mobile sidebar toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-4 left-4 z-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <XIcon /> : <MenuIcon />}
            </Button>

            {/* Sidebar for mobile */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 border-b">
                        <h2 className="text-xl font-bold">MediConnect EMR</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {filteredItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center p-2 rounded-md hover:bg-gray-100",
                                            pathname === item.href ? "bg-gray-100 text-primary" : "text-gray-700",
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="p-4 border-t">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => signOut()}>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
                    <div className="flex items-center justify-center h-16 border-b">
                        <h2 className="text-xl font-bold">MediConnect EMR</h2>
                    </div>
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <nav className="flex-1 p-4">
                            <ul className="space-y-2">
                                {filteredItems.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center p-2 rounded-md hover:bg-gray-100",
                                                pathname === item.href ? "bg-gray-100 text-primary" : "text-gray-700",
                                            )}
                                        >
                                            <item.icon className="mr-3 h-5 w-5" />
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="p-4 border-t">
                            <div className="flex items-center mb-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{user?.email}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => signOut()}>
                                <LogOutIcon className="mr-2 h-4 w-4" />
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
