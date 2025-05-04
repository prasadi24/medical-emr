import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RequireRole } from "@/components/auth/require-role"
import { FileText, CreditCard, DollarSign, BarChart4, FileSpreadsheet } from "lucide-react"

export default function BillingDashboardPage() {
    return (
        <RequireRole roles={["Admin", "Billing Staff"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
                    <p className="text-muted-foreground">Manage invoices, payments, and billing items</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">Manage Invoices</div>
                                <p className="text-xs text-muted-foreground">Create, view, and manage patient invoices</p>
                                <Button asChild className="w-full">
                                    <Link href="/billing/invoices">View Invoices</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payments</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">Process Payments</div>
                                <p className="text-xs text-muted-foreground">Record and track payments for invoices</p>
                                <Button asChild className="w-full">
                                    <Link href="/billing/payments">View Payments</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Billing Items</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">Manage Billing Items</div>
                                <p className="text-xs text-muted-foreground">Configure services, procedures, and products</p>
                                <Button asChild className="w-full">
                                    <Link href="/billing/items">View Billing Items</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">Manage Claims</div>
                                <p className="text-xs text-muted-foreground">Submit and track insurance claims</p>
                                <Button asChild className="w-full">
                                    <Link href="/billing/claims">View Claims</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reports</CardTitle>
                            <BarChart4 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">Financial Reports</div>
                                <p className="text-xs text-muted-foreground">Generate and view financial reports</p>
                                <Button asChild className="w-full">
                                    <Link href="/billing/reports">View Reports</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireRole>
    )
}
