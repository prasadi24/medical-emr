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
    Building2Icon,
    FlaskConicalIcon,
    StethoscopeIcon,
    ReceiptIcon,
    ShieldIcon,
    FileTextIcon,
    ActivityIcon,
    HeartPulseIcon,
    ClipboardIcon,
} from "lucide-react"

type SidebarItem = {
    title: string
    href: string
    icon: React.ElementType
    roles?: string[]
    subItems?: { title: string; href: string }[]
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
        subItems: [
            {
                title: "All Appointments",
                href: "/appointments",
            },
            {
                title: "Schedule New",
                href: "/appointments/new",
            },
            {
                title: "Today's Appointments",
                href: "/appointments?day=today",
            },
            {
                title: "Upcoming",
                href: "/appointments?upcoming=true",
            },
        ],
    },
    {
        title: "Medical Records",
        href: "/medical-records",
        icon: ClipboardListIcon,
        roles: ["Admin", "Doctor", "Nurse"],
    },
    {
        title: "Doctors",
        href: "/doctors",
        icon: StethoscopeIcon,
        roles: ["Admin"],
    },
    {
        title: "Staff",
        href: "/staff",
        icon: UserIcon,
        roles: ["Admin"],
    },
    {
        title: "Clinics",
        href: "/clinics",
        icon: Building2Icon,
        roles: ["Admin"],
    },
    {
        title: "Lab Tests",
        href: "/lab-tests",
        icon: FlaskConicalIcon,
        roles: ["Admin", "Doctor", "Lab Technician"],
    },
    {
        title: "Prescriptions",
        href: "/prescriptions",
        icon: FileTextIcon,
        roles: ["Admin", "Doctor", "Pharmacist"],
    },
    {
        title: "Vitals",
        href: "/vitals",
        icon: HeartPulseIcon,
        roles: ["Admin", "Doctor", "Nurse"],
    },
    {
        title: "Billing",
        href: "/billing",
        icon: ReceiptIcon,
        roles: ["Admin", "Billing Specialist"],
    },
    {
        title: "User Management",
        href: "/users",
        icon: UsersIcon,
        roles: ["Admin"],
    },
    {
        title: "Roles & Permissions",
        href: "/roles",
        icon: ShieldIcon,
        roles: ["Admin"],
    },
    {
        title: "Audit Logs",
        href: "/audit-logs",
        icon: ActivityIcon,
        roles: ["Admin", "IT Support"],
    },
    {
        title: "My Health",
        href: "/my-health",
        icon: HeartPulseIcon,
        roles: ["Patient"],
    },
    {
        title: "My Records",
        href: "/my-records",
        icon: ClipboardIcon,
        roles: ["Patient"],
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

    // Group sidebar items by category for better organization
    const groupedItems = filteredItems.reduce<Record<string, SidebarItem[]>>((acc, item) => {
        // Determine category based on item properties or roles
        let category = "General"

        if (item.title === "Dashboard") {
            category = "General"
        } else if (["Patients", "Appointments", "Medical Records", "Vitals", "Prescriptions"].includes(item.title)) {
            category = "Patient Care"
        } else if (["Doctors", "Staff", "Clinics"].includes(item.title)) {
            category = "Administration"
        } else if (["Lab Tests", "Billing"].includes(item.title)) {
            category = "Services"
        } else if (["User Management", "Roles & Permissions", "Audit Logs"].includes(item.title)) {
            category = "System"
        } else if (["My Health", "My Records"].includes(item.title)) {
            category = "Patient Portal"
        }

        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(item)
        return acc
    }, {})

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
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden dark:bg-gray-900",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 border-b dark:border-gray-800">
                        <h2 className="text-xl font-bold">MediConnect EMR</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4">
                        {Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className="mb-6">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 dark:text-gray-400">{category}</h3>
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    pathname === item.href
                                                        ? "bg-gray-100 text-primary dark:bg-gray-800"
                                                        : "text-gray-700 dark:text-gray-300",
                                                )}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.title}
                                            </Link>
                                            {item.subItems && (
                                                <ul className="ml-6 mt-2 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                                                    {item.subItems.map((subItem) => (
                                                        <li key={subItem.href}>
                                                            <Link
                                                                href={subItem.href}
                                                                className={cn(
                                                                    "flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm",
                                                                    pathname === subItem.href
                                                                        ? "bg-gray-100 text-primary dark:bg-gray-800"
                                                                        : "text-gray-700 dark:text-gray-300",
                                                                )}
                                                            >
                                                                {subItem.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                    <div className="p-4 border-t dark:border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
                <div className="flex flex-col flex-1 min-h-0 bg-white border-r dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-center h-16 border-b dark:border-gray-800">
                        <h2 className="text-xl font-bold">MediConnect EMR</h2>
                    </div>
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <nav className="flex-1 p-4">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} className="mb-6">
                                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 dark:text-gray-400">{category}</h3>
                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                                                        pathname === item.href
                                                            ? "bg-gray-100 text-primary dark:bg-gray-800"
                                                            : "text-gray-700 dark:text-gray-300",
                                                    )}
                                                >
                                                    <item.icon className="mr-3 h-5 w-5" />
                                                    {item.title}
                                                </Link>
                                                {item.subItems && (
                                                    <ul className="ml-6 mt-2 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                                                        {item.subItems.map((subItem) => (
                                                            <li key={subItem.href}>
                                                                <Link
                                                                    href={subItem.href}
                                                                    className={cn(
                                                                        "flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm",
                                                                        pathname === subItem.href
                                                                            ? "bg-gray-100 text-primary dark:bg-gray-800"
                                                                            : "text-gray-700 dark:text-gray-300",
                                                                    )}
                                                                >
                                                                    {subItem.title}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                        <div className="p-4 border-t dark:border-gray-800">
                            <div className="flex items-center mb-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
