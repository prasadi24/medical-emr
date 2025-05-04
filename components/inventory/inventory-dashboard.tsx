"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Truck, Plus } from "lucide-react"

interface InventoryDashboardProps {
    stats: {
        totalItems: number
        lowStockItems: number
        outOfStockItems: number
        totalValue: number
        recentTransactions: any[]
        topCategories: { name: string; count: number }[]
    }
}

export function InventoryDashboard({ stats }: InventoryDashboardProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">Items in inventory</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">Items below reorder level</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.outOfStockItems}</div>
                        <p className="text-xs text-muted-foreground">Items with zero stock</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Current inventory value</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest inventory movements</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentTransactions.length > 0 ? (
                                stats.recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {transaction.transaction_type === "purchase" ? (
                                                <TrendingUp className="h-5 w-5 text-green-500" />
                                            ) : transaction.transaction_type === "usage" ? (
                                                <TrendingDown className="h-5 w-5 text-red-500" />
                                            ) : transaction.transaction_type === "return" ? (
                                                <Truck className="h-5 w-5 text-amber-500" />
                                            ) : (
                                                <ShoppingCart className="h-5 w-5 text-blue-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{transaction.item_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={
                                                    transaction.transaction_type === "purchase"
                                                        ? "success"
                                                        : transaction.transaction_type === "usage"
                                                            ? "destructive"
                                                            : transaction.transaction_type === "return"
                                                                ? "warning"
                                                                : "default"
                                                }
                                            >
                                                {transaction.transaction_type}
                                            </Badge>
                                            <span className="text-sm font-medium">
                                                {transaction.transaction_type === "usage" || transaction.transaction_type === "return"
                                                    ? "-"
                                                    : "+"}
                                                {transaction.quantity}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No recent transactions</p>
                            )}

                            <div className="pt-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/inventory/transactions">View All Transactions</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Categories</CardTitle>
                        <CardDescription>Categories with most items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topCategories.length > 0 ? (
                                stats.topCategories.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{category.name}</p>
                                        <Badge variant="outline">{category.count} items</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No categories found</p>
                            )}

                            <div className="pt-2 space-y-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/inventory/categories">Manage Categories</Link>
                                </Button>
                                <Button asChild className="w-full">
                                    <Link href="/inventory/items/new">
                                        <Plus className="mr-2 h-4 w-4" /> Add New Item
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
