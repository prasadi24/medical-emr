import Link from "next/link"
import { getLabTestCategories, getLabTestTypes } from "@/app/actions/lab-test-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LabTestCategoriesList } from "@/components/lab-tests/lab-test-categories-list"
import { LabTestTypesList } from "@/components/lab-tests/lab-test-types-list"
import { Plus } from "lucide-react"

export default async function LabTestsPage() {
    const [categories, testTypes] = await Promise.all([getLabTestCategories(), getLabTestTypes()])

    return (
        <RequireRole roles={["Admin", "Lab Technician"]} fallback={<div>Access denied</div>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lab Tests</h1>
                        <p className="text-muted-foreground">Manage lab test categories and types</p>
                    </div>
                </div>

                <Tabs defaultValue="test-types">
                    <TabsList>
                        <TabsTrigger value="test-types">Test Types</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>
                    <TabsContent value="test-types" className="space-y-4 pt-4">
                        <div className="flex justify-end">
                            <Button asChild>
                                <Link href="/lab-tests/types/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Test Type
                                </Link>
                            </Button>
                        </div>
                        <LabTestTypesList testTypes={testTypes} categories={categories} />
                    </TabsContent>
                    <TabsContent value="categories" className="space-y-4 pt-4">
                        <div className="flex justify-end">
                            <Button asChild>
                                <Link href="/lab-tests/categories/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Link>
                            </Button>
                        </div>
                        <LabTestCategoriesList categories={categories} />
                    </TabsContent>
                </Tabs>
            </div>
        </RequireRole>
    )
}
