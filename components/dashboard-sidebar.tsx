"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    BarChart3,
    BookOpen,
    Calendar,
    ChevronDown,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Settings,
    User,
    Users,
} from "lucide-react"

export function DashboardSidebar() {
    const { user, signOut } = useAuth()
    const pathname = usePathname()

    // Define navigation items based on user role
    const adminNavItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/faculty", label: "Faculty", icon: GraduationCap },
        { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
        { href: "/admin/feedback", label: "Feedback", icon: FileText },
        { href: "/admin/trainings", label: "Trainings", icon: ClipboardList },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    const facultyNavItems = [
        { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/faculty/subjects", label: "My Subjects", icon: BookOpen },
        { href: "/faculty/students", label: "Students", icon: Users },
        { href: "/faculty/feedback", label: "Feedback", icon: FileText },
        { href: "/faculty/evaluations", label: "Evaluations", icon: ClipboardList },
        { href: "/faculty/settings", label: "Settings", icon: Settings },
    ]

    const studentNavItems = [
        { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/feedback", label: "Feedback", icon: FileText },
        { href: "/student/profile", label: "My Profile", icon: User },
        { href: "/student/trainings", label: "Trainings", icon: ClipboardList },
        { href: "/student/time-manager", label: "Time Manager", icon: Calendar },
        { href: "/student/placement", label: "Placement", icon: BarChart3 },
        { href: "/student/settings", label: "Settings", icon: Settings },
    ]

    // Select navigation items based on user role
    let navItems = studentNavItems
    if (user?.role === "admin") {
        navItems = adminNavItems
    } else if (user?.role === "faculty") {
        navItems = facultyNavItems
    }

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || "U"

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="font-semibold">EduFeedback</div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                <Link href={item.href}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" alt={user?.name || user?.email || "User"} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col items-start text-sm">
                                <span className="font-medium">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
